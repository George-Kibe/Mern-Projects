import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { StaticBoard } from '../../components/StaticBoard';
import { StockfishEngine, type StockfishAnalysis, type StockfishScore } from '../../lib/stockfish/engine';
import { parsePgn, type ParsedPgn } from '../../lib/pgn/parsePgn';
import { annotateMoves, formatEvalCp } from '../../lib/analysis/classifyMove';

type AnalysisState = {
  perPosition: Array<StockfishAnalysis | null>; // length = fens.length
  running: boolean;
  error: string | null;
};

function scoreToDisplay(score: StockfishScore | null): string {
  if (!score) return '…';
  if (score.type === 'mate') {
    const n = Math.abs(score.value);
    const sign = score.value >= 0 ? '' : '-';
    return `M${sign}${n}`;
  }
  return (score.value / 100).toFixed(2);
}

function scoreToCpForBar(score: StockfishScore | null): number | null {
  if (!score) return null;
  if (score.type === 'mate') {
    // Treat mate as a huge advantage for the bar.
    return Math.sign(score.value) * 100000;
  }
  return score.value;
}

function uciMoveToSan(fen: string, uci: string): string | null {
  // UCI: e2e4, e7e8q, etc.
  if (uci.length < 4) return null;
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = uci.length >= 5 ? uci[4] : undefined;

  try {
    const c = new Chess();
    c.load(fen);
    const mv = c.move({ from, to, promotion });
    return mv?.san ?? null;
  } catch {
    return null;
  }
}

function pvToSanLine(fen: string, pv: string[] | null, maxPlies = 8): string | null {
  if (!pv || pv.length === 0) return null;

  const c = new Chess();
  try {
    c.load(fen);
  } catch {
    return null;
  }

  const out: string[] = [];
  for (const uci of pv.slice(0, maxPlies)) {
    const from = uci.slice(0, 2) as Square;
    const to = uci.slice(2, 4) as Square;
    const promotion = uci.length >= 5 ? uci[4] : undefined;
    const mv = c.move({ from, to, promotion });
    if (!mv) break;
    out.push(mv.san);
  }

  return out.length ? out.join(' ') : null;
}

function EvalBar({ evalCp }: { evalCp: number | null }) {
  const clamped = evalCp === null ? 0 : Math.max(-800, Math.min(800, evalCp));
  // 0% => black winning, 100% => white winning
  const pct = ((clamped + 800) / 1600) * 100;
  return (
    <div className="w-full">
      <div
        className="h-3 w-full rounded overflow-hidden bg-[#111]"
        style={{ background: `linear-gradient(to right, #f5f5f5 ${pct}%, #111 ${pct}%)` }}
        aria-label="Evaluation bar"
      />
    </div>
  );
}

const Analyze = () => {
  const engineRef = useRef<StockfishEngine | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [pgnText, setPgnText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [game, setGame] = useState<ParsedPgn | null>(null);
  const [currentPly, setCurrentPly] = useState<number>(0); // position index

  const [movetimeMs, setMovetimeMs] = useState<number>(350);

  const [evalsCp, setEvalsCp] = useState<Array<number | null>>([]); // per position, White POV
  const [analysis, setAnalysis] = useState<AnalysisState>({ perPosition: [], running: false, error: null });

  const [pvPreview, setPvPreview] = useState<null | {
    basePly: number; // position index in the real game
    uciLine: string[];
    fens: string[]; // length = uciLine.length + 1
    idx: number;
    sanLine: string;
  }>(null);

  useEffect(() => {
    const engine = new StockfishEngine();
    engineRef.current = engine;

    return () => {
      abortRef.current?.abort();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // If previewing a PV line, show that line on the board instead of the game's mainline.
  const displayedFen = useMemo(() => {
    if (pvPreview && pvPreview.fens[pvPreview.idx]) return pvPreview.fens[pvPreview.idx];
    return game?.fens?.[currentPly] ?? new Chess().fen();
  }, [game, currentPly, pvPreview]);

  const chessForBoard = useMemo(() => {
    const c = new Chess();
    try {
      c.load(displayedFen);
    } catch {
      // ignore
    }
    return c;
  }, [displayedFen]);

  const currentScore = analysis.perPosition[currentPly]?.score ?? null;
  const currentEvalCpForBar = scoreToCpForBar(currentScore);

  const annotations = useMemo(() => {
    if (!game) return [];
    if (!evalsCp.length) return [];

    const bestMoveUciByPosition = analysis.perPosition.map((p) => p?.bestMove ?? null);
    const pvUciByPosition = analysis.perPosition.map((p) => p?.pv ?? null);

    return annotateMoves({
      sanMoves: game.sanMoves,
      fens: game.fens,
      evalsCp,
      bestMoveUciByPosition,
      pvUciByPosition,
    });
  }, [game, evalsCp, analysis.perPosition]);

  const keyMoments = useMemo(() => {
    return annotations.filter(
      (a) => a.missedChance || a.tag === 'inaccuracy' || a.tag === 'mistake' || a.tag === 'blunder' || a.tag === 'brilliant',
    );
  }, [annotations]);

  const explanationText = useMemo(() => {
    if (!game) return 'Upload a PGN file to start.';
    if (currentPly === 0) return 'Starting position.';

    const moveIdx = currentPly - 1;
    const ann = annotations[moveIdx];
    if (!ann) return 'Analysis not available for this move yet.';

    const moveNo = Math.floor(moveIdx / 2) + 1;
    const prefix = ann.mover === 'w' ? `${moveNo}.` : `${moveNo}...`;

    const beforePosAnalysis = analysis.perPosition[moveIdx] ?? null; // position BEFORE this move
    const bestMoveSan = beforePosAnalysis?.bestMove ? uciMoveToSan(game.fens[moveIdx], beforePosAnalysis.bestMove) : null;
    const pvSan = pvToSanLine(game.fens[moveIdx], beforePosAnalysis?.pv ?? null, 8);

    const rec = bestMoveSan ? ` Recommended: ${bestMoveSan}.` : '';
    const pvLine = pvSan ? ` Best line: ${pvSan}.` : '';

    return `${prefix} ${ann.san} — ${ann.tag}${ann.missedChance ? ' (missed chance)' : ''}. ${ann.explanation}${rec}${pvLine}`;
  }, [annotations, currentPly, game, analysis.perPosition]);

  async function onUpload(file: File) {
    const text = await file.text();
    setFileName(file.name);
    setPgnText(text);

    try {
      const parsed = parsePgn(text);
      setGame(parsed);
      setCurrentPly(0);
      setPvPreview(null);
      setEvalsCp(new Array(parsed.fens.length).fill(null));
      setAnalysis({ perPosition: new Array(parsed.fens.length).fill(null), running: false, error: null });
    } catch (e) {
      setGame(null);
      setPvPreview(null);
      setAnalysis({ perPosition: [], running: false, error: e instanceof Error ? e.message : String(e) });
    }
  }

  async function runAnalysis() {
    if (!game) return;
    if (!engineRef.current) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setAnalysis((s) => ({ ...s, running: true, error: null }));

    for (let i = 0; i < game.fens.length; i++) {
      if (ac.signal.aborted) break;

      try {
        const res = await engineRef.current.analyzePosition({
          fen: game.fens[i],
          movetimeMs,
          signal: ac.signal,
        });

        const cp = scoreToCpForBar(res.score);

        setAnalysis((s) => {
          const next = s.perPosition.length ? [...s.perPosition] : new Array(game.fens.length).fill(null);
          next[i] = res;
          return { ...s, perPosition: next };
        });

        setEvalsCp((prev) => {
          const next = prev.length ? [...prev] : new Array(game.fens.length).fill(null);
          next[i] = cp;
          return next;
        });
      } catch (e) {
        if (ac.signal.aborted) break;
        setAnalysis((s) => ({ ...s, error: e instanceof Error ? e.message : String(e) }));
        break;
      }
    }

    setAnalysis((s) => ({ ...s, running: false }));
  }

  function stopAnalysis() {
    abortRef.current?.abort();
    engineRef.current?.stop();
    setAnalysis((s) => ({ ...s, running: false }));
  }

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="w-full px-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col gap-2 w-full items-center">
            <div className="text-4xl font-bold self-center">Analyze Your Games Here</div>
            <div className="text-sm opacity-80">
                Upload a PGN from Lichess or Chess.com, then run Stockfish analysis.</div>
          <div className="flex flex-col gap-2  ">
            <input
              type="file"
              accept=".pgn"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onUpload(f);
              }}
              className="text-sm bg-gray-200 p-2 rounded-md"
            />

            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap">Move time</label>
              <input
                type="range"
                min={100}
                max={1500}
                step={50}
                value={movetimeMs}
                onChange={(e) => setMovetimeMs(Number(e.target.value))}
              />
              <div className="text-sm w-14 text-right">{movetimeMs}ms</div>
            </div>

            {!analysis.running ? (
              <button
                className="px-3 py-2 bg-green-700 text-white rounded bg-bgAuxiliary3 hover:opacity-90 text-sm"
                disabled={!game}
                onClick={() => void runAnalysis()}
              >
                Analyze
              </button>
            ) : (
              <button className="px-3 py-2 rounded bg-red-600 hover:opacity-90 text-sm" onClick={stopAnalysis}>
                Stop Analysis
              </button>
            )}
          </div>
        </div>
        </div>

        {analysis.error ? <div className="text-red-400 text-sm">{analysis.error}</div> : null}

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-4 items-center">
            <div className="w-full flex flex-col items-center gap-3">
              <StaticBoard board={chessForBoard.board()} />

              <div className="w-full max-w-[560px] flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="opacity-80">{fileName || 'No PGN loaded'}</div>
                  <div className="font-mono">Eval: {scoreToDisplay(currentScore)}</div>
                </div>
                <EvalBar evalCp={currentEvalCpForBar} />

                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    className="px-3 py-2 rounded bg-bgAuxiliary3 hover:opacity-90 text-sm"
                    onClick={() => {
                      setPvPreview(null);
                      setCurrentPly(0);
                    }}
                    disabled={!game || currentPly === 0}
                  >
                    |◀
                  </button>
                  <button
                    className="px-3 py-2 rounded bg-bgAuxiliary3 hover:opacity-90 text-sm"
                    onClick={() => {
                      setPvPreview(null);
                      setCurrentPly((p) => Math.max(0, p - 1));
                    }}
                    disabled={!game || currentPly === 0}
                  >
                    ◀
                  </button>
                  <button
                    className="px-3 py-2 rounded bg-bgAuxiliary3 hover:opacity-90 text-sm"
                    onClick={() => {
                      setPvPreview(null);
                      setCurrentPly((p) => (game ? Math.min(game.fens.length - 1, p + 1) : p));
                    }}
                    disabled={!game || (game && currentPly >= game.fens.length - 1)}
                  >
                    ▶
                  </button>
                  <button
                    className="px-3 py-2 rounded bg-bgAuxiliary3 hover:opacity-90 text-sm"
                    onClick={() => {
                      setPvPreview(null);
                      if (game) setCurrentPly(game.fens.length - 1);
                    }}
                    disabled={!game || (game && currentPly >= game.fens.length - 1)}
                  >
                    ▶|
                  </button>

                  <button
                    className="px-3 py-2 rounded bg-bgAuxiliary3 hover:opacity-90 text-sm"
                    disabled={!game || !analysis.perPosition[currentPly]?.pv}
                    onClick={() => {
                      if (!game) return;
                      const pv = analysis.perPosition[currentPly]?.pv;
                      if (!pv || pv.length === 0) return;

                      const baseFen = game.fens[currentPly];
                      const c = new Chess();
                      c.load(baseFen);

                      const fens: string[] = [baseFen];
                      for (const uci of pv) {
                        const from = uci.slice(0, 2) as Square;
                        const to = uci.slice(2, 4) as Square;
                        const promotion = uci.length >= 5 ? uci[4] : undefined;
                        const mv = c.move({ from, to, promotion });
                        if (!mv) break;
                        fens.push(c.fen());
                        if (fens.length >= 12) break; // keep preview short for UX
                      }

                      setPvPreview({
                        basePly: currentPly,
                        uciLine: pv.slice(0, fens.length - 1),
                        fens,
                        idx: 0,
                        sanLine: pvToSanLine(baseFen, pv, 10) ?? pv.slice(0, 10).join(' '),
                      });
                    }}
                    title="Preview Stockfish best line on the board"
                  >
                    Preview best line
                  </button>
                </div>

                {pvPreview ? (
                  <div className="rounded bg-bgAuxiliary3 p-3 text-sm">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold">Previewing best line</div>
                        <button
                          className="px-2 py-1 rounded bg-bgMain border border-white/10 hover:opacity-90 text-xs"
                          onClick={() => setPvPreview(null)}
                        >
                          Exit
                        </button>
                      </div>

                      <div className="font-mono text-xs opacity-80">{pvPreview.sanLine}</div>

                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          className="px-3 py-2 rounded bg-bgMain border border-white/10 hover:opacity-90 text-sm"
                          onClick={() => setPvPreview((p) => (p ? { ...p, idx: 0 } : p))}
                          disabled={pvPreview.idx === 0}
                        >
                          |◀
                        </button>
                        <button
                          className="px-3 py-2 rounded bg-bgMain border border-white/10 hover:opacity-90 text-sm"
                          onClick={() => setPvPreview((p) => (p ? { ...p, idx: Math.max(0, p.idx - 1) } : p))}
                          disabled={pvPreview.idx === 0}
                        >
                          ◀
                        </button>
                        <button
                          className="px-3 py-2 rounded bg-bgMain border border-white/10 hover:opacity-90 text-sm"
                          onClick={() =>
                            setPvPreview((p) => (p ? { ...p, idx: Math.min(p.fens.length - 1, p.idx + 1) } : p))
                          }
                          disabled={pvPreview.idx >= pvPreview.fens.length - 1}
                        >
                          ▶
                        </button>
                        <button
                          className="px-3 py-2 rounded bg-bgMain border border-white/10 hover:opacity-90 text-sm"
                          onClick={() => setPvPreview((p) => (p ? { ...p, idx: p.fens.length - 1 } : p))}
                          disabled={pvPreview.idx >= pvPreview.fens.length - 1}
                        >
                          ▶|
                        </button>
                      </div>

                      <div className="text-xs opacity-80 text-center">
                        Step {pvPreview.idx}/{pvPreview.fens.length - 1} (from position {pvPreview.basePly})
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded bg-bgAuxiliary3 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Explanation</div>
                    <button
                      className="px-2 py-1 rounded bg-bgMain border border-white/10 hover:opacity-90 text-xs"
                      onClick={() => speak(explanationText)}
                    >
                      Speak
                    </button>
                  </div>
                  <div className="mt-2 opacity-90">{explanationText}</div>

                  {game?.fens?.[currentPly] && analysis.perPosition[currentPly]?.pv ? (
                    <div className="mt-2 font-mono text-xs opacity-80">
                      PV: {pvToSanLine(game.fens[currentPly], analysis.perPosition[currentPly]?.pv ?? null, 10) ??
                        analysis.perPosition[currentPly]?.pv?.slice(0, 12).join(' ')}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-md bg-bgAuxiliary3 p-3 overflow-auto lg:max-h-[85vh]">
            <div className="flex flex-col gap-4">
              <div>
                <div className="font-semibold">Moves</div>
                {!game ? (
                  <div className="text-sm opacity-80 mt-2">Upload a PGN to see moves.</div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {game.sanMoves.map((san, idx) => {
                      const ply = idx + 1;
                      const isActive = currentPly === ply;
                      const moveNo = Math.floor(idx / 2) + 1;
                      const prefix = idx % 2 === 0 ? `${moveNo}.` : `${moveNo}...`;

                      const ann = annotations[idx];
                      const tag = ann?.tag;
                      const chip =
                        tag === 'blunder'
                          ? 'bg-red-600'
                          : tag === 'mistake'
                            ? 'bg-orange-600'
                            : tag === 'inaccuracy'
                              ? 'bg-yellow-600'
                              : tag === 'brilliant'
                                ? 'bg-emerald-600'
                                : 'bg-bgMain';

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setPvPreview(null);
                            setCurrentPly(ply);
                          }}
                          className={`px-2 py-1 rounded text-xs border border-white/10 hover:opacity-90 ${
                            isActive ? 'ring-2 ring-white/40' : ''
                          } ${chip}`}
                          title={ann ? `${ann.tag}${ann.missedChance ? ' (missed chance)' : ''} — loss ${ann.lossCp ?? 0}cp` : ''}
                        >
                          {prefix} {san}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="font-semibold">Key moments</div>
                {keyMoments.length === 0 ? (
                  <div className="text-sm opacity-80 mt-2">No key moments detected yet.</div>
                ) : (
                  <div className="mt-2 flex flex-col gap-2">
                    {keyMoments.slice(0, 30).map((m) => {
                      const moveNo = Math.floor(m.ply / 2) + 1;
                      const prefix = m.mover === 'w' ? `${moveNo}.` : `${moveNo}...`;
                      return (
                        <button
                          key={m.ply}
                          onClick={() => {
                            setPvPreview(null);
                            setCurrentPly(m.ply + 1);
                          }}
                          className="text-left text-sm rounded bg-bgMain border border-white/10 px-3 py-2 hover:opacity-90"
                        >
                          <div className="font-semibold">
                            {prefix} {m.san} — {m.tag}
                            {m.missedChance ? ' (missed chance)' : ''}
                          </div>
                          <div className="opacity-80 text-xs">Eval after: {formatEvalCp(m.evalAfterCp)}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {pgnText ? (
                <details className="text-sm">
                  <summary className="cursor-pointer opacity-80">Raw PGN</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs opacity-80">{pgnText}</pre>
                </details>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
