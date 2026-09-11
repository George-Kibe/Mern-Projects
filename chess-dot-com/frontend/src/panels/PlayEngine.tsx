import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess, type Color, type Square } from 'chess.js';
import { Board } from '../components/Board';
import { EvalBar } from '../components/EvalBar';
import { Button, Field, Panel, Select, Toggle } from '../components/ui';
import { downloadTextFile, pgnFilename } from '../lib/pgn/exportPgn';
import { ENGINE_LEVELS, getLevel } from '../lib/stockfish/levels';
import { getEngine } from '../lib/stockfish/pool';
import { formatCp, scoreToCp } from '../lib/analysis/score';
import { describeMove, type MoveInsight } from '../lib/chess/describeMove';
import { useAppDispatch, useAppSelector } from '../store';
import { setBlunderAlerts, setLevelId, setPlayAsWhite, setShowLiveEval, setTimeControlId } from '../store/engineSlice';
import { Clock } from '../components/Clock';
import { useChessClock } from '../hooks/useChessClock';
import { TIME_CONTROLS, getTimeControl } from '../lib/time/controls';
import { saveGame } from '../store/gamesSlice';

const START_FEN = new Chess().fen();

export function PlayEngine({ onAnalyze }: { onAnalyze: (pgn: string, label: string) => void }) {
  const dispatch = useAppDispatch();
  const { levelId, playAsWhite, showLiveEval, blunderAlerts, timeControlId } = useAppSelector((s) => s.engine);
  const level = getLevel(levelId);
  const playerColor = playAsWhite ? 'w' : 'b';

  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(START_FEN);
  const [sans, setSans] = useState<string[]>([]);
  const [turn, setTurn] = useState<Color>('w');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hint, setHint] = useState<{ from: Square; to: Square } | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);
  const [evalCp, setEvalCp] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Guards against React 18/19 StrictMode running the effect twice.
  const engineBusyRef = useRef(false);

  /** Engine's read on the position you were about to move from. */
  const preMoveRef = useRef<{ fen: string; cp: number | null; bestUci: string | null } | null>(null);
  const [coach, setCoach] = useState<null | {
    san: string;
    lossCp: number;
    better: MoveInsight | null;
    evalAfterCp: number | null;
  }>(null);

  const control = getTimeControl(timeControlId);

  const onFlag = useCallback(
    (loser: Color) => {
      // Running out of time ends the game exactly as a checkmate would.
      setGameOver(`${loser === 'w' ? '0-1' : '1-0'} (${loser === 'w' ? 'White' : 'Black'} ran out of time)`);
    },
    [],
  );

  const clock = useChessClock({
    control,
    // Paused before the first move and once the game is over.
    activeColor: gameOver || sans.length === 0 ? null : turn,
    onFlag,
  });

  // Destructured because the hook returns a fresh object every tick; depending
  // on the whole object re-created applyMove 10x a second, which re-ran the
  // engine effect and cancelled its search before it could ever move.
  const { press: clockPress, reset: clockReset } = clock;

  const sync = useCallback(() => {
    const chess = chessRef.current;
    setFen(chess.fen());
    setSans(chess.history());
    setTurn(chess.turn());
  }, []);

  const resultOf = useCallback((chess: Chess): string | null => {
    if (!chess.isGameOver()) return null;
    if (chess.isCheckmate()) return chess.turn() === 'w' ? '0-1' : '1-0';
    if (chess.isStalemate()) return '1/2-1/2 (stalemate)';
    if (chess.isInsufficientMaterial()) return '1/2-1/2 (insufficient material)';
    if (chess.isThreefoldRepetition()) return '1/2-1/2 (repetition)';
    if (chess.isDrawByFiftyMoves()) return '1/2-1/2 (fifty-move rule)';
    return '1/2-1/2';
  }, []);

  const newGame = useCallback(() => {
    chessRef.current = new Chess();
    setLastMove(null);
    setHint(null);
    setHintText(null);
    setEvalCp(null);
    setGameOver(null);
    setSaved(false);
    setCoach(null);
    preMoveRef.current = null;
    engineBusyRef.current = false;
    clockReset();
    sync();
  }, [sync, clockReset]);

  // Read the position while it is your move, so the cost of what you play next
  // can be measured against it.
  useEffect(() => {
    if (!blunderAlerts || gameOver) return;
    if (turn !== playerColor) return;

    const ac = new AbortController();
    const fenNow = fen;
    void (async () => {
      try {
        const res = await getEngine('analysis').analyzePosition({
          fen: fenNow,
          movetimeMs: 300,
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        preMoveRef.current = {
          fen: fenNow,
          cp: scoreToCp(res.score),
          bestUci: res.bestMove,
        };
      } catch {
        /* aborted or busy; the check simply does not fire */
      }
    })();
    return () => ac.abort();
  }, [fen, turn, playerColor, blunderAlerts, gameOver]);

  /** Compare what you played against what the engine wanted, and explain it. */
  const checkMove = useCallback(
    async (fenAfter: string, san: string) => {
      const pre = preMoveRef.current;
      if (!pre || pre.cp === null) return;

      try {
        const res = await getEngine('analysis').analyzePosition({ fen: fenAfter, movetimeMs: 300 });
        const afterCp = scoreToCp(res.score);
        if (afterCp === null) return;

        // Both are White-POV; convert to what it cost *you*.
        const lossCp = playerColor === 'w' ? pre.cp - afterCp : afterCp - pre.cp;
        if (lossCp < 150) return;

        setCoach({
          san,
          lossCp,
          better: pre.bestUci ? describeMove(pre.fen, pre.bestUci) : null,
          evalAfterCp: afterCp,
        });
      } catch {
        /* engine busy — skip this check rather than interrupt the game */
      }
    },
    [playerColor],
  );

  /** Apply a move that has already been validated by chess.js. */
  const applyMove = useCallback(
    (move: { from: Square; to: Square; promotion?: string }) => {
      const chess = chessRef.current;
      const wasPlayersMove = chess.turn() === playerColor;
      try {
        const mv = chess.move(move);
        if (!mv) return false;
        setLastMove({ from: mv.from as Square, to: mv.to as Square });
        setHint(null);
        setHintText(null);
        setCoach(null);
        sync();
        clockPress(mv.color);
        setGameOver(resultOf(chess));

        if (wasPlayersMove && blunderAlerts) void checkMove(mv.after, mv.san);
        return true;
      } catch {
        return false;
      }
    },
    [sync, resultOf, playerColor, blunderAlerts, checkMove, clockPress],
  );

  // ---- Engine replies whenever it is its turn ----
  useEffect(() => {
    const chess = chessRef.current;
    if (gameOver || chess.isGameOver()) return;
    if (chess.turn() === playerColor) return;
    if (engineBusyRef.current) return;

    engineBusyRef.current = true;
    let cancelled = false;

    void (async () => {
      try {
        const uci = await getEngine('play').chooseMove({
          fen: chess.fen(),
          movetimeMs: level.movetimeMs,
          skillLevel: level.skillLevel,
          elo: level.elo,
        });
        if (cancelled || !uci) return;
        applyMove({
          from: uci.slice(0, 2) as Square,
          to: uci.slice(2, 4) as Square,
          promotion: uci.length >= 5 ? uci[4] : undefined,
        });
      } finally {
        engineBusyRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fen, playerColor, gameOver, level, applyMove]);

  // ---- Optional live evaluation, on the *analysis* engine so it never
  //      competes with the opponent's own search ----
  useEffect(() => {
    // Clearing on disable happens in the toggle handler; an effect must not
    // call setState synchronously.
    if (!showLiveEval) return;

    const ac = new AbortController();
    void (async () => {
      try {
        const res = await getEngine('analysis').analyzePosition({
          fen,
          movetimeMs: 250,
          signal: ac.signal,
        });
        if (!ac.signal.aborted) setEvalCp(scoreToCp(res.score));
      } catch {
        /* aborted or engine unavailable */
      }
    })();
    return () => ac.abort();
  }, [fen, showLiveEval]);

  async function showHint() {
    const chess = chessRef.current;
    if (chess.isGameOver() || chess.turn() !== playerColor) return;
    setHintText('Thinking…');
    try {
      const res = await getEngine('analysis').analyzePosition({ fen: chess.fen(), movetimeMs: 500 });
      if (!res.bestMove) {
        setHintText(null);
        return;
      }
      const from = res.bestMove.slice(0, 2) as Square;
      const to = res.bestMove.slice(2, 4) as Square;
      setHint({ from, to });
      const insight = describeMove(chess.fen(), res.bestMove);
      setHintText(insight ? `${insight.san} — ${insight.headline}` : null);
    } catch {
      setHintText(null);
    }
  }

  function takeback() {
    const chess = chessRef.current;
    // Undo the engine's reply as well, so it stays your move.
    if (chess.history().length === 0) return;
    chess.undo();
    if (chess.history().length > 0 && chess.turn() !== playerColor) chess.undo();
    setGameOver(null);
    setLastMove(null);
    setHint(null);
    setHintText(null);
    sync();
  }

  function buildPgn(): string {
    const chess = chessRef.current;
    chess.setHeader('Event', 'Training game vs Stockfish');
    chess.setHeader('Site', 'Local');
    chess.setHeader('Date', new Date().toISOString().slice(0, 10).replace(/-/g, '.'));
    chess.setHeader('White', playAsWhite ? 'You' : `Stockfish (${level.name})`);
    chess.setHeader('Black', playAsWhite ? `Stockfish (${level.name})` : 'You');
    return chess.pgn();
  }

  function saveToLibrary() {
    if (sans.length === 0) return;
    dispatch(
      saveGame({
        pgn: buildPgn(),
        label: `vs ${level.name}${playAsWhite ? ' (as White)' : ' (as Black)'}`,
        source: 'engine',
        result: gameOver ?? 'unfinished',
      }),
    );
    setSaved(true);
  }

  // Derived from synced state rather than the ref, so render stays pure.
  const yourTurn = !gameOver && turn === playerColor;
  const thinking = !gameOver && turn !== playerColor;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {showLiveEval ? <EvalBar cp={evalCp} /> : null}
          <div className="flex w-full max-w-[min(54vh,520px)] flex-col gap-2">
            {clock.enabled ? (
              <Clock
                ms={clock.times[playerColor === 'w' ? 'b' : 'w']}
                active={!gameOver && turn !== playerColor && sans.length > 0}
                flagged={clock.flagged === (playerColor === 'w' ? 'b' : 'w')}
                label={`${level.name} (${playerColor === 'w' ? 'Black' : 'White'})`}
              />
            ) : null}
          <Board
            fen={fen}
            orientation={playerColor}
            interactive={yourTurn}
            onMove={applyMove}
            lastMove={lastMove}
            arrows={hint ? [{ ...hint, color: 'var(--color-tag-inaccuracy)' }] : []}
            maxSize="max-w-full"
          />
            {clock.enabled ? (
              <Clock
                ms={clock.times[playerColor]}
                active={!gameOver && turn === playerColor && sans.length > 0}
                flagged={clock.flagged === playerColor}
                label={`You (${playerColor === 'w' ? 'White' : 'Black'})`}
              />
            ) : null}
          </div>
        </div>

        <div className="flex min-h-[1.5rem] items-center gap-2 text-sm">
          {gameOver ? (
            <span className="font-semibold text-accent">Game over — {gameOver}</span>
          ) : thinking ? (
            <span className="text-ink-soft">{level.name} is thinking…</span>
          ) : yourTurn ? (
            <span className="text-ink-soft">Your move.</span>
          ) : null}
        </div>

        {hintText ? (
          <div className="rounded border border-tag-inaccuracy/40 bg-panel px-3 py-2 text-sm">
            <span className="text-tag-inaccuracy">Hint: </span>
            {hintText}
          </div>
        ) : null}

        {/* Caught a costly move: say what it cost, what was better, and offer
            to put it back so the position can be played properly. */}
        {coach ? (
          <div
            className={`rounded-lg border px-3 py-2 ${
              coach.lossCp >= 300
                ? 'border-tag-blunder/60 bg-tag-blunder/10'
                : 'border-tag-mistake/60 bg-tag-mistake/10'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">
                {coach.lossCp >= 300 ? 'Blunder' : 'Mistake'}: {coach.san}
              </span>
              <span className="font-mono text-xs text-ink-soft">
                costs {(Math.min(coach.lossCp, 900) / 100).toFixed(1)} pawns · now{' '}
                {formatCp(coach.evalAfterCp)}
              </span>
            </div>

            {coach.better ? (
              <div className="mt-1 text-sm">
                <span className="text-ink-soft">Better was </span>
                <span className="font-mono font-semibold">{coach.better.san}</span>
                <span className="text-ink-soft"> — {coach.better.headline}</span>
                {coach.better.facts.length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {coach.better.facts.map((f, i) => (
                      <li key={i} className="text-xs text-ink-soft">· {f}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <div className="mt-2 flex gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  takeback();
                  setCoach(null);
                }}
              >
                ↩ Take it back and try again
              </Button>
              <Button variant="ghost" onClick={() => setCoach(null)}>
                Play on
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <Panel title="Opponent" bodyClassName="p-3 flex flex-col gap-3">
          <Field label="Strength">
            <Select value={levelId} onChange={(v) => dispatch(setLevelId(Number(v)))}>
              {ENGINE_LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} (~{l.elo})
                </option>
              ))}
            </Select>
          </Field>
          <p className="text-xs text-ink-soft">{level.blurb}</p>

          <Field label="Time control">
            <Select value={timeControlId} onChange={(v) => dispatch(setTimeControlId(v))}>
              {TIME_CONTROLS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.category === 'Untimed' ? t.label : `${t.label} · ${t.category}`}
                </option>
              ))}
            </Select>
          </Field>
          <p className="-mt-1 text-xs text-ink-soft">
            The clock starts on your first move. Changing it starts a new game.
          </p>

          <Field label="You play">
            <Select value={playAsWhite ? 'w' : 'b'} onChange={(v) => dispatch(setPlayAsWhite(v === 'w'))}>
              <option value="w">White</option>
              <option value="b">Black</option>
            </Select>
          </Field>

          <Toggle
            checked={blunderAlerts}
            onChange={(v) => {
              dispatch(setBlunderAlerts(v));
              if (!v) setCoach(null);
            }}
            label="Coach my blunders"
            hint="After each of your moves, check it and explain anything that loses material"
          />

          <Toggle
            checked={showLiveEval}
            onChange={(v) => {
              dispatch(setShowLiveEval(v));
              if (!v) setEvalCp(null);
            }}
            label="Show live evaluation"
            hint="Useful for training, but it does tell you when you have gone wrong"
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={newGame}>New game</Button>
            <Button variant="ghost" onClick={takeback} disabled={sans.length === 0 || thinking}>
              Take back
            </Button>
            <Button variant="ghost" onClick={() => void showHint()} disabled={!yourTurn}>
              Hint
            </Button>
          </div>
        </Panel>

        <Panel title="Moves" bodyClassName="max-h-[300px] overflow-auto p-3">
          {sans.length === 0 ? (
            <p className="text-sm text-ink-soft">No moves yet — make your first move on the board.</p>
          ) : (
            <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-0.5 font-mono text-sm">
              {Array.from({ length: Math.ceil(sans.length / 2) }, (_, i) => (
                <div key={i} className="contents">
                  <span className="text-ink-soft">{i + 1}.</span>
                  <span>{sans[i * 2]}</span>
                  <span>{sans[i * 2 + 1] ?? ''}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {sans.length > 0 ? (
          <Panel title="When you're done" bodyClassName="p-3 flex flex-col gap-2">
            <p className="text-sm text-ink-soft">
              Send this game to the analysis board to find out where it turned.
            </p>
            <Button
              variant="primary"
              onClick={() => onAnalyze(buildPgn(), `vs ${level.name}`)}
            >
              Analyze this game
            </Button>
            <Button variant="ghost" onClick={saveToLibrary} disabled={saved}>
              {saved ? 'Saved to your games' : 'Save to your games'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => downloadTextFile(pgnFilename(`vs ${level.name}`), buildPgn())}
              title="Save this game as a .pgn file you can re-analyze later"
            >
              ⭳ Download PGN
            </Button>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
