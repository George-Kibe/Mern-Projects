import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { Board, type BoardArrow } from '../components/Board';
import { EvalBar } from '../components/EvalBar';
import { MoveList } from '../components/MoveList';
import { Alternatives } from '../components/Alternatives';
import { Button, Field, Panel, Select, Toggle } from '../components/ui';
import { parsePgn, type ParsedPgn } from '../lib/pgn/parsePgn';
import { buildAnnotatedPgn, downloadTextFile, pgnFilename } from '../lib/pgn/exportPgn';
import { annotateMoves, type MoveAnnotation } from '../lib/analysis/classifyMove';
import { buildNarration } from '../lib/analysis/narrate';
import { accuracyFromLosses, formatCp, scoreToCp } from '../lib/analysis/score';
import { detectMoment, findMoments, type MomentLine } from '../lib/analysis/moment';
import { LearnPanel } from '../components/LearnPanel';
import { describeMove, pvToSan } from '../lib/chess/describeMove';
import type { StockfishAnalysis } from '../lib/stockfish/engine';
import { getEngine } from '../lib/stockfish/pool';
import { describeSpeechProblem, useSpeech } from '../lib/speech/useSpeech';
import {
  checkServerSpeech,
  fetchHostVoices,
  fetchTtsEngines,
  serverSpeak,
  serverStopSpeech,
  speakRendered,
  stopRenderedSpeech,
  type HostVoice,
  type TtsEngineInfo,
} from '../lib/speech/serverSpeech';
import { useAppDispatch, useAppSelector } from '../store';
import { setAnalysisMovetimeMs, setHostVoice, setMultiPv, setVoiceEnabled, setVoiceRate, setVoiceUri } from '../store/engineSlice';
import { removeGame, saveGame } from '../store/gamesSlice';

type Preview = {
  basePly: number;
  fens: string[];
  sans: string[];
  uci: string[];
  /** 0 = the position the line starts from; 1 = after its first move. */
  idx: number;
  label: string;
};

const START_FEN = new Chess().fen();

/** Must stay in step with the badge colours used by Alternatives. */
const ARROW_COLORS = ['var(--color-arrow-1)', 'var(--color-arrow-2)'];

export function Analyze({ pgnToLoad }: { pgnToLoad: { pgn: string; label: string; token: number } | null }) {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.engine);
  const savedGames = useAppSelector((s) => s.games.games);

  const [label, setLabel] = useState('');
  const [game, setGame] = useState<ParsedPgn | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentPly, setCurrentPly] = useState(0);
  const [analysis, setAnalysis] = useState<Array<StockfishAnalysis | null>>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const [preview, setPreview] = useState<Preview | null>(null);
  const [hoverArrow, setHoverArrow] = useState<{ from: Square; to: Square } | null>(null);
  const [orientation, setOrientation] = useState<'w' | 'b'>('w');

  const abortRef = useRef<AbortController | null>(null);
  const speech = useSpeech({
    enabled: settings.voiceEnabled,
    rate: settings.voiceRate,
    voiceUri: settings.voiceUri,
  });

  // Can the local server speak for us if the browser cannot?
  const [serverVoice, setServerVoice] = useState<boolean | null>(null);
  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      const ok = await checkServerSpeech(ac.signal);
      if (!ac.signal.aborted) setServerVoice(ok);
    })();
    return () => ac.abort();
  }, []);

  const browserVoiceUsable = speech.supported && speech.hasVoices;

  const [ttsEngines, setTtsEngines] = useState<TtsEngineInfo[]>([]);
  useEffect(() => {
    if (!serverVoice) return;
    const ac = new AbortController();
    void (async () => {
      const engines = await fetchTtsEngines(ac.signal);
      if (!ac.signal.aborted) setTtsEngines(engines);
    })();
    return () => ac.abort();
  }, [serverVoice]);

  const [hostVoices, setHostVoices] = useState<HostVoice[]>([]);
  const [hostModules, setHostModules] = useState<string[]>([]);
  useEffect(() => {
    if (!serverVoice) return;
    const ac = new AbortController();
    void (async () => {
      const { modules, voices } = await fetchHostVoices(settings.hostVoice.module, ac.signal);
      if (ac.signal.aborted) return;
      setHostModules(modules);
      setHostVoices(voices);
    })();
    return () => ac.abort();
  }, [serverVoice, settings.hostVoice.module]);

  const renderedVoice = ttsEngines.length > 0;
  // Only espeak-ng (and the spd-say route) expose a pitch control.
  const pitchSupported = !renderedVoice || (settings.hostVoice.module ?? ttsEngines[0]?.id) === 'espeak-ng';

  /**
   * Speak through whichever channel actually works, best first.
   *
   * Server-rendered audio wins when available: it is the only route that needs
   * nothing from the browser's own speech stack, which is what kept failing.
   */
  const say = useCallback(
    (text: string) => {
      if (renderedVoice) {
        void (async () => {
          const played = await speakRendered(text, settings.hostVoice, settings.hostVoice.module ?? undefined);
          if (played) return;
          // Rendering or playback failed — fall back rather than go silent.
          if (browserVoiceUsable) speech.speak(text);
          else if (serverVoice) void serverSpeak(text, settings.hostVoice);
        })();
        return;
      }
      if (browserVoiceUsable) {
        speech.speak(text);
        return;
      }
      if (serverVoice) {
        void serverSpeak(text, settings.hostVoice);
      }
    },
    [renderedVoice, browserVoiceUsable, serverVoice, speech, settings.hostVoice],
  );

  const hushAll = useCallback(() => {
    speech.cancel();
    stopRenderedSpeech();
    if (serverVoice) void serverStopSpeech();
  }, [speech, serverVoice]);


  const loadPgn = useCallback((text: string, newLabel: string) => {
    try {
      const parsed = parsePgn(text);
      if (parsed.sanMoves.length === 0) {
        setError('That PGN parsed, but contains no moves.');
        return;
      }
      setGame(parsed);
      setLabel(newLabel);
      setCurrentPly(0);
      setPreview(null);
      setAnalysis(new Array(parsed.fens.length).fill(null));
      setProgress(0);
      setError(null);
    } catch (e) {
      setGame(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // A game handed over from the Play panel. Applied during render rather than in
  // an effect so the board never paints the previous game for a frame first.
  const [loadedToken, setLoadedToken] = useState<number | null>(null);
  if (pgnToLoad && pgnToLoad.token !== loadedToken) {
    setLoadedToken(pgnToLoad.token);
    loadPgn(pgnToLoad.pgn, pgnToLoad.label);
  }

  const evalsCp = useMemo(
    () => analysis.map((a) => scoreToCp(a?.score ?? null)),
    [analysis],
  );

  const annotations: MoveAnnotation[] = useMemo(() => {
    if (!game || evalsCp.length === 0) return [];
    return annotateMoves({
      sanMoves: game.sanMoves,
      fens: game.fens,
      evalsCp,
      bestMoveUciByPosition: analysis.map((a) => a?.bestMove ?? null),
      pvUciByPosition: analysis.map((a) => a?.pv ?? null),
    });
  }, [game, evalsCp, analysis]);

  const accuracy = useMemo(() => {
    if (annotations.length === 0) return { w: null as number | null, b: null as number | null };
    return {
      w: accuracyFromLosses(annotations.filter((a) => a.mover === 'w').map((a) => a.lossCp)),
      b: accuracyFromLosses(annotations.filter((a) => a.mover === 'b').map((a) => a.lossCp)),
    };
  }, [annotations]);

  // Coach text for the move being shown inside a variation.
  const previewInsight = useMemo(() => {
    if (!preview || preview.idx < 1) return null;
    const fenBefore = preview.fens[preview.idx - 1];
    const uci = preview.uci[preview.idx - 1];
    if (!fenBefore || !uci) return null;
    return describeMove(fenBefore, uci);
  }, [preview]);

  const keyMoments = useMemo(
    () =>
      annotations.filter(
        (a) => a.tag === 'blunder' || a.tag === 'mistake' || a.tag === 'inaccuracy' || a.tag === 'brilliant' || a.missedChance,
      ),
    [annotations],
  );

  const displayedFen = preview ? preview.fens[preview.idx] : (game?.fens[currentPly] ?? START_FEN);
  const currentAnalysis = analysis[currentPly] ?? null;

  // What is there to learn at the position on screen?
  const moment = useMemo(() => {
    if (!game) return null;
    return detectMoment({
      ply: currentPly,
      fens: game.fens,
      sanMoves: game.sanMoves,
      annotations,
      analyses: analysis,
    });
  }, [game, currentPly, annotations, analysis]);

  /** Every teaching moment in the game, for the jump-to list. */
  const allMoments = useMemo(() => {
    if (!game) return [];
    return findMoments({
      fens: game.fens,
      sanMoves: game.sanMoves,
      annotations,
      analyses: analysis,
    });
  }, [game, annotations, analysis]);

  /** Step through a line on the board, keeping the way back to the game. */
  const playOutLine = useCallback(
    (fromPly: number, pv: string[], label = 'Engine line') => {
      if (!game) return;
      const baseFen = game.fens[fromPly];
      const sans = pvToSan(baseFen, pv, 12);
      const fens = fensForLine(baseFen, pv, 12);
      if (fens.length < 2) return;

      // Start on the first move of the line, not on the position it starts from
      // — landing on the unchanged board looks like the button did nothing.
      setPreview({
        basePly: fromPly,
        fens,
        sans,
        uci: pv.slice(0, fens.length - 1),
        idx: 1,
        label,
      });
    },
    [game],
  );

  /** Open one of a moment's lines, moving the board there first if needed. */
  const openLine = useCallback(
    (line: MomentLine) => {
      if (!game) return;
      if (line.fromPly !== currentPly) setCurrentPly(line.fromPly);
      playOutLine(line.fromPly, line.pv, line.label);
    },
    [game, currentPly, playOutLine],
  );


  const lastMove = useMemo(() => {
    if (preview || !game || currentPly === 0) return null;
    const fenBefore = game.fens[currentPly - 1];
    const san = game.sanMoves[currentPly - 1];
    return sanToSquares(fenBefore, san);
  }, [game, currentPly, preview]);

  // Full coaching narration for the move that led to the current position.
  //
  // Both surrounding positions must be evaluated first: narrating from a
  // half-filled analysis produces confident nonsense ("a reasonable move, no
  // evaluation") for what is actually a blunder.
  const narration = useMemo(() => {
    if (!game || currentPly === 0) return null;
    const idx = currentPly - 1;
    const ann = annotations[idx];
    if (!ann) return null;
    if (!analysis[idx] || !analysis[currentPly]) return null;
    return buildNarration({
      annotation: ann,
      fenBefore: game.fens[idx],
      bestUci: analysis[idx]?.bestMove ?? null,
      pvUci: analysis[idx]?.pv ?? null,
    });
  }, [game, currentPly, annotations, analysis]);

  // Speak each new position once, never on re-render.
  const lastSpokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (!settings.voiceEnabled || !narration) return;
    // Keyed on the text, so a narration that improves once the engine catches
    // up is spoken, while a re-render of the same advice is not.
    if (lastSpokenRef.current === narration) return;
    lastSpokenRef.current = narration;
    say(narration);
  }, [narration, settings.voiceEnabled, say]);

  // Analyse whatever position you are looking at, even without a full run.
  // Without this the arrows and candidate moves only ever appear for positions
  // the batch run has already reached, which makes them easy to never see.
  useEffect(() => {
    if (!game || running || preview) return;
    if (analysis[currentPly]) return;

    const ac = new AbortController();
    const fen = game.fens[currentPly];

    void (async () => {
      try {
        const res = await getEngine('analysis').analyzePosition({
          fen,
          movetimeMs: settings.analysisMovetimeMs,
          multiPv: settings.multiPv,
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        setAnalysis((prev) => {
          const next = [...prev];
          next[currentPly] = res;
          return next;
        });
      } catch {
        /* aborted, or the engine is busy — the batch run will fill this in */
      }
    })();

    return () => ac.abort();
  }, [game, currentPly, running, preview, analysis, settings.analysisMovetimeMs, settings.multiPv]);

  const goTo = useCallback(
    (ply: number) => {
      if (!game) return;
      setPreview(null);
      setCurrentPly(Math.max(0, Math.min(game.fens.length - 1, ply)));
    },
    [game],
  );

  // Arrow keys step through the game, as in every other analysis board.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (preview) setPreview((p) => (p ? { ...p, idx: Math.max(1, p.idx - 1) } : p));
        else goTo(currentPly - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (preview) setPreview((p) => (p ? { ...p, idx: Math.min(p.fens.length - 1, p.idx + 1) } : p));
        else goTo(currentPly + 1);
      } else if (e.key === 'Escape' && preview) {
        setPreview(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, currentPly, preview]);

  async function runAnalysis() {
    if (!game) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setRunning(true);
    setError(null);
    setProgress(0);

    const engine = getEngine('analysis');

    for (let i = 0; i < game.fens.length; i++) {
      if (ac.signal.aborted) break;
      try {
        const res = await engine.analyzePosition({
          fen: game.fens[i],
          movetimeMs: settings.analysisMovetimeMs,
          multiPv: settings.multiPv,
          signal: ac.signal,
        });
        setAnalysis((prev) => {
          const next = [...prev];
          next[i] = res;
          return next;
        });
        setProgress(i + 1);
      } catch (e) {
        if (!ac.signal.aborted) {
          setError(e instanceof Error ? e.message : String(e));
        }
        break;
      }
    }

    setRunning(false);
  }

  function stopAnalysis() {
    abortRef.current?.abort();
    getEngine('analysis').stop();
    setRunning(false);
  }

  // The engine's two best moves, numbered on the board so the badge and the
  // candidate list refer to the same thing at a glance.
  const arrows = useMemo((): BoardArrow[] => {
    if (hoverArrow) return [{ ...hoverArrow, color: ARROW_COLORS[0] }];
    if (preview) return [];

    const lines = currentAnalysis?.lines ?? [];
    return lines.slice(0, 2).flatMap((line, i) => {
      const uci = line.pv[0];
      if (!uci || uci.length < 4) return [];
      return [
        {
          from: uci.slice(0, 2) as Square,
          to: uci.slice(2, 4) as Square,
          color: ARROW_COLORS[i],
          label: String(i + 1),
        },
      ];
    });
  }, [hoverArrow, currentAnalysis, preview]);

  const totalPositions = game?.fens.length ?? 0;

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* ---------- Board column ----------
          Pinned to the top of the viewport so stepping through a game never
          moves the board: only the analysis underneath it scrolls. */}
      <div className="flex flex-col gap-3 xl:sticky xl:top-3 xl:max-h-[calc(100vh-1.5rem)]">
        {!game ? (
          <PgnLoader onLoad={loadPgn} error={error} />
        ) : (
          <>
            <div className="flex shrink-0 items-start gap-3">
              <EvalBar cp={evalsCp[currentPly] ?? null} height="h-[min(54vh,520px)]" />
              <Board
                fen={displayedFen}
                orientation={orientation}
                lastMove={lastMove}
                arrows={arrows}
                maxSize="max-w-[min(54vh,520px)]"
                alert={
                  !preview && moment ? { label: moment.badge, tone: moment.tone } : null
                }
              />
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button onClick={() => goTo(0)} disabled={currentPly === 0} variant="ghost">⏮</Button>
              <Button onClick={() => goTo(currentPly - 1)} disabled={currentPly === 0} variant="ghost">◀</Button>
              <Button
                onClick={() => goTo(currentPly + 1)}
                disabled={currentPly >= totalPositions - 1}
                variant="ghost"
              >
                ▶
              </Button>
              <Button
                onClick={() => goTo(totalPositions - 1)}
                disabled={currentPly >= totalPositions - 1}
                variant="ghost"
              >
                ⏭
              </Button>
              <Button onClick={() => setOrientation((o) => (o === 'w' ? 'b' : 'w'))} variant="ghost">
                Flip
              </Button>

              <span className="ml-auto text-xs text-ink-soft">
                {currentPly}/{totalPositions - 1} · use ← →
              </span>
            </div>

            <LearnPanel
              moment={preview ? null : moment}
              fallbackText={narration}
              open={
                preview
                  ? {
                      lineId: preview.label,
                      label: preview.label,
                      basePly: preview.basePly,
                      sans: preview.sans,
                      idx: preview.idx,
                    }
                  : null
              }
              insight={previewInsight}
              onOpenLine={openLine}
              onStep={(idx) =>
                setPreview((p) =>
                  p ? { ...p, idx: Math.max(1, Math.min(p.fens.length - 1, idx)) } : p,
                )
              }
              onClose={() => setPreview(null)}
              onSpeak={() => {
                if (speech.speaking) hushAll();
                else if (narration) say(narration);
              }}
              speaking={speech.speaking}
            />

          </>
        )}
      </div>

      {/* ---------- Side column ---------- */}
      <div className="flex flex-col gap-3">
        <Panel
          title={game ? label || 'Loaded game' : 'Analysis'}
          actions={
            game ? (
              running ? (
                <Button variant="danger" onClick={stopAnalysis}>Stop</Button>
              ) : (
                <Button variant="primary" onClick={() => void runAnalysis()}>
                  {progress > 0 ? 'Re-analyze' : 'Analyze'}
                </Button>
              )
            ) : null
          }
          bodyClassName="p-3 flex flex-col gap-3"
        >
          {running ? (
            <div>
              <div className="h-1.5 overflow-hidden rounded bg-panel-soft">
                <div
                  className="h-full bg-accent transition-[width]"
                  style={{ width: `${totalPositions ? (progress / totalPositions) * 100 : 0}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-ink-soft">
                Position {progress} of {totalPositions}
              </div>
            </div>
          ) : null}

          {error ? <div className="text-sm text-tag-blunder">{error}</div> : null}

          {game && progress > 0 ? (
            <div className="flex gap-4 text-sm">
              <div>
                <div className="text-xs uppercase text-ink-soft">White accuracy</div>
                <div className="font-mono text-lg">
                  {accuracy.w !== null ? accuracy.w.toFixed(1) : '–'}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-ink-soft">Black accuracy</div>
                <div className="font-mono text-lg">
                  {accuracy.b !== null ? accuracy.b.toFixed(1) : '–'}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs uppercase text-ink-soft">Eval</div>
                <div className="font-mono text-lg">{formatCp(evalsCp[currentPly] ?? null)}</div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Field label={`Time / move: ${settings.analysisMovetimeMs}ms`}>
              <input
                type="range"
                min={100}
                max={2000}
                step={50}
                value={settings.analysisMovetimeMs}
                onChange={(e) => dispatch(setAnalysisMovetimeMs(Number(e.target.value)))}
                className="accent-accent"
              />
            </Field>
            <Field label={`Candidate moves: ${settings.multiPv}`}>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={settings.multiPv}
                onChange={(e) => dispatch(setMultiPv(Number(e.target.value)))}
                className="accent-accent"
              />
            </Field>
          </div>

          <div className="border-t border-line pt-2">
            <Toggle
              checked={settings.voiceEnabled}
              onChange={(v) => {
                dispatch(setVoiceEnabled(v));
                if (v) {
                  if (narration) say(narration);
                } else {
                  hushAll();
                }
              }}
              label="Speak the coaching aloud"
              hint="Narrates each move as you step through the game"
            />
            {settings.voiceEnabled && browserVoiceUsable ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Field label="Voice">
                  <Select
                    value={settings.voiceUri ?? ''}
                    onChange={(v) => dispatch(setVoiceUri(v || null))}
                  >
                    <option value="">Browser default</option>
                    {speech.voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={`Speed: ${settings.voiceRate.toFixed(1)}x`}>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={settings.voiceRate}
                    onChange={(e) => dispatch(setVoiceRate(Number(e.target.value)))}
                    className="accent-accent"
                  />
                </Field>
              </div>
            ) : null}

            {/* Host voice: espeak-ng defaults are quiet and fast, so these matter. */}
            {settings.voiceEnabled && (renderedVoice || (!browserVoiceUsable && serverVoice)) ? (
              <div className="mt-2 flex flex-col gap-2">
                {renderedVoice ? (
                  <Field label="Voice engine">
                    <Select
                      value={settings.hostVoice.module ?? ttsEngines[0].id}
                      onChange={(v) => dispatch(setHostVoice({ module: v }))}
                    >
                      {ttsEngines.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                ) : null}

                {!renderedVoice && hostModules.length > 1 ? (
                  <Field label="Engine">
                    <Select
                      value={settings.hostVoice.module ?? ''}
                      onChange={(v) => dispatch(setHostVoice({ module: v || null, voice: null }))}
                    >
                      <option value="">System default</option>
                      {hostModules.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                  </Field>
                ) : null}

                {!renderedVoice ? (
                  <Field label="Voice">
                    <Select
                      value={settings.hostVoice.voice ?? ''}
                      onChange={(v) => dispatch(setHostVoice({ voice: v || null }))}
                    >
                      <option value="">Default</option>
                      {hostVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.language})
                        </option>
                      ))}
                    </Select>
                  </Field>
                ) : null}

                <div className={`grid gap-2 ${pitchSupported ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <Field label={`Volume ${Math.max(0, settings.hostVoice.volume)}%`}>
                    <input
                      type="range"
                      // Rendered audio plays through the page, where volume is 0-100%.
                      min={renderedVoice ? 0 : -100}
                      max={100}
                      step={5}
                      value={settings.hostVoice.volume}
                      onChange={(e) => dispatch(setHostVoice({ volume: Number(e.target.value) }))}
                      className="accent-accent"
                    />
                  </Field>
                  <Field label={`Speed ${settings.hostVoice.rate}`}>
                    <input
                      type="range" min={-70} max={70} step={5}
                      value={settings.hostVoice.rate}
                      onChange={(e) => dispatch(setHostVoice({ rate: Number(e.target.value) }))}
                      className="accent-accent"
                    />
                  </Field>
                  {pitchSupported ? (
                    <Field label={`Pitch ${settings.hostVoice.pitch}`}>
                      <input
                        type="range" min={-70} max={70} step={5}
                        value={settings.hostVoice.pitch}
                        onChange={(e) => dispatch(setHostVoice({ pitch: Number(e.target.value) }))}
                        className="accent-accent"
                      />
                    </Field>
                  ) : null}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => say('Knight takes e four. That is a blunder. Better was queen e seven.')}
                >
                  Test this voice
                </Button>

                {!renderedVoice ? (
                  <p className="text-xs text-ink-soft">
                    This is <code>espeak-ng</code> through speech-dispatcher, which is robotic by
                    design. For a clearly better voice run{' '}
                    <code>sudo apt install libttspico-utils</code> and restart the server — the app
                    will render audio and play it here instead.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {settings.voiceEnabled && renderedVoice ? (
            <p className="text-xs text-ink-soft">
              Spoken with {ttsEngines[0].name}, rendered by the local server and played here.
            </p>
          ) : null}

          {settings.voiceEnabled && !browserVoiceUsable && serverVoice === false && speech.voicesSettled ? (
            <div className="rounded border border-tag-inaccuracy/40 bg-panel-soft px-2 py-1.5 text-xs text-tag-inaccuracy">
              <p>{describeSpeechProblem(speech.problem ?? { kind: 'no-voices' })}</p>
              <p className="mt-1 text-ink-soft">
                Or start the game server (<code>npm run dev</code> in <code>backend/</code>) and
                reload — it can speak through your system with no browser flags.
              </p>
            </div>
          ) : null}

          {game ? (
            <div className="flex flex-col gap-2 border-t border-line pt-2">
              <Button
                variant="ghost"
                onClick={() =>
                  downloadTextFile(
                    pgnFilename(label || 'game'),
                    buildAnnotatedPgn(game, annotations, { Annotator: 'Stockfish (Chess Trainer)' }),
                  )
                }
                title={
                  annotations.length
                    ? 'Downloads the game with the engine verdicts saved as move comments'
                    : 'Downloads the game; run the analysis first to include the engine verdicts'
                }
              >
                ⭳ Download PGN{annotations.length ? ' (with analysis)' : ''}
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  dispatch(
                    saveGame({
                      pgn: buildAnnotatedPgn(game, annotations),
                      label: label || 'Analyzed game',
                      source: 'import',
                      result: game.headers.Result ?? '*',
                    }),
                  )
                }
              >
                Save to your games
              </Button>

              <Button variant="ghost" onClick={() => { setGame(null); setProgress(0); setAnalysis([]); }}>
                Load a different game
              </Button>
            </div>
          ) : null}
        </Panel>

        {game ? (
          <>
            <Panel title="Engine's candidate moves" bodyClassName="max-h-[380px] overflow-auto">
              <Alternatives
                fen={game.fens[currentPly]}
                lines={currentAnalysis?.lines ?? []}
                ply={currentPly}
                playedSan={game.sanMoves[currentPly] ?? null}
                onHoverLine={setHoverArrow}
                onPreviewLine={(pv) => playOutLine(currentPly, pv, 'Engine line')}
              />
            </Panel>

            {allMoments.length > 0 ? (
              <Panel
                title={`Learning moments (${allMoments.length})`}
                bodyClassName="max-h-[300px] overflow-auto"
              >
                <div className="flex flex-col divide-y divide-line">
                  {allMoments.map(({ ply, moment: m }) => (
                    <button
                      key={`${ply}-${m.kind}`}
                      onClick={() => goTo(ply)}
                      className={`px-3 py-2 text-left hover:bg-panel-soft ${
                        currentPly === ply ? 'bg-panel-soft' : ''
                      }`}
                      title={m.why}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            m.tone === 'critical'
                              ? 'bg-tag-blunder text-white'
                              : m.tone === 'warning'
                                ? 'bg-tag-mistake text-black'
                                : m.tone === 'good'
                                  ? 'bg-tag-brilliant text-black'
                                  : 'bg-accent text-black'
                          }`}
                        >
                          {m.badge}
                        </span>
                        <span className="truncate text-sm">{m.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>
            ) : null}

            <Panel title="Moves" bodyClassName="py-1">
              <MoveList
                sanMoves={game.sanMoves}
                annotations={annotations}
                currentPly={currentPly}
                onSelectPly={goTo}
              />
            </Panel>

            {keyMoments.length > 0 ? (
              <Panel title={`Key moments (${keyMoments.length})`} bodyClassName="max-h-[260px] overflow-auto">
                <div className="flex flex-col divide-y divide-line">
                  {keyMoments.map((m) => (
                    <button
                      key={m.ply}
                      onClick={() => goTo(m.ply + 1)}
                      className="px-3 py-2 text-left hover:bg-panel-soft"
                    >
                      <div className="text-sm">
                        <span className="font-mono">
                          {Math.floor(m.ply / 2) + 1}
                          {m.mover === 'w' ? '.' : '...'} {m.san}
                        </span>{' '}
                        <span className={`text-tag-${m.tag}`}>{m.tag}</span>
                        {m.missedChance ? (
                          <span className="text-ink-soft"> · missed chance</span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>
            ) : null}
          </>
        ) : savedGames.length > 0 ? (
          <Panel title="Your games" bodyClassName="max-h-[400px] overflow-auto">
            <div className="flex flex-col divide-y divide-line">
              {savedGames.map((g) => (
                <div key={g.id} className="flex items-center gap-2 px-3 py-2">
                  <button
                    onClick={() => loadPgn(g.pgn, g.label)}
                    className="flex-1 text-left text-sm hover:text-accent"
                  >
                    <div>{g.label}</div>
                    <div className="text-xs text-ink-soft">
                      {g.result} · {new Date(g.savedAt).toLocaleString()}
                    </div>
                  </button>
                  <button
                    onClick={() => downloadTextFile(pgnFilename(g.label), g.pgn)}
                    className="text-xs text-ink-soft hover:text-accent"
                    title="Download this game as a .pgn file"
                  >
                    download
                  </button>
                  <button
                    onClick={() => dispatch(removeGame(g.id))}
                    className="text-xs text-ink-soft hover:text-tag-blunder"
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function PgnLoader({
  onLoad,
  error,
}: {
  onLoad: (pgn: string, label: string) => void;
  error: string | null;
}) {
  const [text, setText] = useState('');

  return (
    <Panel title="Load a game to analyze" bodyClassName="p-4 flex flex-col gap-3">
      <p className="text-sm text-ink-soft">
        Paste a PGN from Lichess or Chess.com, or drop in a .pgn file. Everything runs in your
        browser — nothing is uploaded.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'[Event "Casual game"]\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 ...'}
        className="h-40 w-full resize-y rounded border border-line bg-panel-soft p-3 font-mono text-xs text-ink outline-none focus:border-accent"
      />

      {error ? <div className="text-sm text-tag-blunder">{error}</div> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={() => onLoad(text, 'Pasted game')} disabled={!text.trim()}>
          Analyze this PGN
        </Button>

        <label className="cursor-pointer rounded border border-line px-3 py-1.5 text-sm text-ink-soft hover:border-accent hover:text-ink">
          Upload .pgn
          <input
            type="file"
            accept=".pgn,text/plain"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onLoad(await file.text(), file.name);
            }}
          />
        </label>
      </div>
    </Panel>
  );
}

/** Replay a UCI line, collecting the FEN after each move. */
function fensForLine(startFen: string, pv: string[], maxPlies: number): string[] {
  const out = [startFen];
  const chess = new Chess();
  try {
    chess.load(startFen);
  } catch {
    return out;
  }
  for (const uci of pv.slice(0, maxPlies)) {
    try {
      const mv = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length >= 5 ? uci[4] : undefined,
      });
      if (!mv) break;
      out.push(chess.fen());
    } catch {
      break;
    }
  }
  return out;
}

/** Which squares a SAN move used, for the last-move highlight. */
function sanToSquares(fen: string, san: string): { from: Square; to: Square } | null {
  try {
    const c = new Chess();
    c.load(fen);
    const mv = c.move(san);
    return mv ? { from: mv.from as Square, to: mv.to as Square } : null;
  } catch {
    return null;
  }
}
