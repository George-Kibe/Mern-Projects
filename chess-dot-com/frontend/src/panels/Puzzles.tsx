import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { Board } from '../components/Board';
import { Button, Field, Panel, Select } from '../components/ui';
import { describeMove } from '../lib/chess/describeMove';
import {
  generatePuzzle,
  type Puzzle,
  type PuzzlePhase,
  type PuzzleTheme,
} from '../lib/puzzles/generate';
import { useAppDispatch, useAppSelector } from '../store';
import { CountdownBar } from '../components/Clock';
import { useCountdown } from '../hooks/useChessClock';
import { PUZZLE_LIMITS, getPuzzleLimit } from '../lib/time/controls';
import {
  puzzleFailed,
  puzzleServed,
  puzzleSolved,
  resetStats,
  setPhase,
  setTargetRating,
  setTheme,
  setTimeLimitId,
} from '../store/puzzlesSlice';

type Status = 'loading' | 'solving' | 'wrong' | 'solved' | 'revealed' | 'empty' | 'timeout';

const PHASES: Array<{ id: PuzzlePhase; label: string }> = [
  { id: 'any', label: 'Any phase' },
  { id: 'opening', label: 'Opening' },
  { id: 'middlegame', label: 'Middlegame' },
  { id: 'endgame', label: 'Endgame' },
];

const THEMES: Array<{ id: PuzzleTheme | 'any'; label: string }> = [
  { id: 'any', label: 'Any tactic' },
  { id: 'mate', label: 'Checkmate' },
  { id: 'material', label: 'Win material' },
];

/** Replay the first `count` moves of a solution to get the position on screen. */
function positionAfter(fen: string, solution: string[], count: number): string {
  const chess = new Chess(fen);
  for (let i = 0; i < count && i < solution.length; i++) {
    const uci = solution[i];
    try {
      chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length >= 5 ? uci[4] : undefined,
      });
    } catch {
      break;
    }
  }
  return chess.fen();
}

export function Puzzles() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.puzzles);

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState('Generating a puzzle…');
  const [wrongMove, setWrongMove] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  /** Set once you get one wrong, so a solve after help is not counted as clean. */
  const [usedHelp, setUsedHelp] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  /** The next puzzle, generated while you solve the current one. */
  const prefetched = useRef<Puzzle | null>(null);
  const scoredRef = useRef(false);

  const seenSet = useMemo(() => new Set(settings.seen), [settings.seen]);

  // Read by the mount effect without making it re-run when settings change.
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const load = useCallback(
    async (usePrefetch: boolean) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setStatus('loading');
      setStep(0);
      setWrongMove(null);
      setHintLevel(0);
      setUsedHelp(false);
      scoredRef.current = false;

      if (usePrefetch && prefetched.current) {
        const ready = prefetched.current;
        prefetched.current = null;
        setPuzzle(ready);
        setStatus('solving');
        dispatch(puzzleServed(ready.fen));
        return;
      }

      setProgress('Generating a puzzle…');
      try {
        const next = await generatePuzzle({
          phase: settings.phase,
          targetRating: settings.targetRating,
          theme: settings.theme,
          signal: ac.signal,
          onProgress: setProgress,
          seen: seenSet,
        });
        if (ac.signal.aborted) return;

        if (!next) {
          setStatus('empty');
          return;
        }
        setPuzzle(next);
        setStatus('solving');
        dispatch(puzzleServed(next.fen));
      } catch {
        if (!ac.signal.aborted) setStatus('empty');
      }
    },
    [dispatch, seenSet, settings.phase, settings.targetRating, settings.theme],
  );

  // First puzzle on mount. Written inline rather than calling load() so no state
  // is set synchronously from the effect — `status` already starts as 'loading'.
  // Runs once: changing the settings must not yank a puzzle away mid-solve,
  // "Next puzzle" picks them up instead.
  useEffect(() => {
    // No "already ran" guard: StrictMode's double mount aborts the first run in
    // its cleanup, so a guard would block the remount and nothing would ever
    // generate. Restarting on remount is correct and costs one wasted search.
    const ac = new AbortController();
    abortRef.current = ac;

    void (async () => {
      try {
        const first = await generatePuzzle({
          phase: settingsRef.current.phase,
          targetRating: settingsRef.current.targetRating,
          theme: settingsRef.current.theme,
          signal: ac.signal,
          onProgress: setProgress,
        });
        if (ac.signal.aborted) return;
        if (!first) {
          setStatus('empty');
          return;
        }
        setPuzzle(first);
        setStatus('solving');
        dispatch(puzzleServed(first.fen));
      } catch {
        if (!ac.signal.aborted) setStatus('empty');
      }
    })();

    return () => ac.abort();
  }, [dispatch]);

  // Build the following puzzle in the background so "Next" feels instant.
  //
  // Keyed on the current puzzle, not on status: hinting or revealing changes the
  // status, and cancelling the prefetch there meant "Next" had to generate from
  // scratch — exactly when the user is most ready to move on.
  useEffect(() => {
    if (!puzzle || prefetched.current) return;

    const ac = new AbortController();
    void (async () => {
      try {
        const next = await generatePuzzle({
          phase: settings.phase,
          targetRating: settings.targetRating,
          theme: settings.theme,
          signal: ac.signal,
          seen: seenSet,
        });
        if (!ac.signal.aborted && next) prefetched.current = next;
      } catch {
        /* the user will just wait a moment on Next */
      }
    })();
    return () => ac.abort();
  }, [puzzle, settings.phase, settings.targetRating, settings.theme, seenSet]);

  const fen = puzzle ? positionAfter(puzzle.fen, puzzle.solution, step) : new Chess().fen();
  const yourTurn = status === 'solving' || status === 'wrong';

  /* ---------- puzzle clock ---------- */

  const limit = getPuzzleLimit(settings.timeLimitId);

  const onExpire = useCallback(() => {
    // Running out counts as a failed attempt, exactly like a wrong move.
    setStatus((current) => (current === 'solving' || current === 'wrong' ? 'timeout' : current));
    setUsedHelp(true);
    if (!scoredRef.current) {
      scoredRef.current = true;
      dispatch(puzzleFailed());
    }
  }, [dispatch]);

  const countdown = useCountdown({
    totalMs: limit.ms,
    running: yourTurn,
    // Restarts the clock for each new puzzle.
    resetKey: puzzle?.id ?? '',
    onExpire,
  });

  /* ---------- solving ---------- */

  function onMove(move: { from: Square; to: Square; promotion?: string }) {
    if (!puzzle || !yourTurn) return false;

    const expected = puzzle.solution[step];
    if (!expected) return false;

    const played = `${move.from}${move.to}${move.promotion ?? ''}`;
    const matches =
      played === expected ||
      // Promotion defaults to a queen when the board did not ask.
      (expected.length === 5 && played === expected.slice(0, 4) + 'q');

    if (!matches) {
      const insight = describeMove(fen, played);
      setWrongMove(insight?.san ?? played);
      setStatus('wrong');
      setUsedHelp(true);
      if (!scoredRef.current) {
        scoredRef.current = true;
        dispatch(puzzleFailed());
      }
      return false;
    }

    setWrongMove(null);
    const afterYours = step + 1;

    // Opponent's forced reply, if the line continues.
    if (afterYours < puzzle.solution.length) {
      setStep(afterYours);
      setStatus('solving');
      setTimeout(() => setStep(Math.min(afterYours + 1, puzzle.solution.length)), 450);
      return true;
    }

    setStep(afterYours);
    setStatus('solved');
    if (!scoredRef.current) {
      scoredRef.current = true;
      dispatch(puzzleSolved());
    }
    return true;
  }

  function reveal() {
    if (!puzzle) return;
    setUsedHelp(true);
    if (!scoredRef.current) {
      scoredRef.current = true;
      dispatch(puzzleFailed());
    }
    setStatus('revealed');
    setStep(0);
    // Walk the line out so the idea is visible, not just stated.
    puzzle.solution.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), 600 * (i + 1));
    });
  }

  const hintSquare = puzzle && hintLevel > 0 ? (puzzle.solution[step]?.slice(0, 2) as Square) : null;
  const hintArrow =
    puzzle && hintLevel > 1 && puzzle.solution[step]
      ? {
          from: puzzle.solution[step].slice(0, 2) as Square,
          to: puzzle.solution[step].slice(2, 4) as Square,
          color: 'var(--color-tag-inaccuracy)',
        }
      : null;

  const accuracy =
    settings.attempted > 0 ? Math.round((settings.solved / settings.attempted) * 100) : null;

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* ---------- Board column ---------- */}
      <div className="flex flex-col gap-3 xl:sticky xl:top-3">
        <div className="flex shrink-0 items-start gap-3">
          <Board
            fen={fen}
            orientation={puzzle?.sideToMove ?? 'w'}
            interactive={yourTurn}
            onMove={onMove}
            lastMove={hintSquare ? { from: hintSquare, to: hintSquare } : null}
            arrows={hintArrow ? [hintArrow] : []}
            maxSize="max-w-[min(54vh,520px)]"
            alert={
              status === 'timeout'
                ? { label: 'out of time', tone: 'critical' }
                : status === 'solved'
                ? { label: 'solved', tone: 'good' }
                : status === 'wrong'
                  ? { label: 'not that one', tone: 'warning' }
                  : status === 'revealed'
                    ? { label: 'solution', tone: 'info' }
                    : puzzle
                      ? {
                          label: `${puzzle.sideToMove === 'w' ? 'White' : 'Black'} to play${
                            puzzle.mateIn ? ` · mate in ${puzzle.mateIn}` : ''
                          }`,
                          tone: 'info',
                        }
                      : null
            }
          />
        </div>

        {countdown.enabled ? (
          <div className="shrink-0">
            <CountdownBar remaining={countdown.remaining} total={limit.ms} />
          </div>
        ) : null}

        <div className="shrink-0 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={() => void load(true)} disabled={status === 'loading'}>
            {status === 'loading' ? 'Generating…' : 'Next puzzle ▶'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setHintLevel((h) => Math.min(2, h + 1));
              setUsedHelp(true);
            }}
            disabled={!yourTurn}
          >
            {hintLevel === 0 ? 'Hint' : hintLevel === 1 ? 'Bigger hint' : 'Hint shown'}
          </Button>
          <Button variant="ghost" onClick={reveal} disabled={!puzzle || status === 'loading'}>
            Show solution
          </Button>
          {status === 'wrong' ? (
            <Button
              variant="ghost"
              onClick={() => {
                setStatus('solving');
                setWrongMove(null);
              }}
            >
              Try again
            </Button>
          ) : null}
        </div>

        {/* ---------- Feedback ---------- */}
        <section className="overflow-hidden rounded-lg border border-line bg-panel">
          <header className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
            <h2 className="text-sm font-semibold">
              {status === 'loading'
                ? 'Building a position'
                : status === 'timeout'
                  ? 'Out of time'
                  : status === 'solved'
                  ? 'Solved'
                  : status === 'revealed'
                    ? 'Solution'
                    : status === 'wrong'
                      ? 'Not that one'
                      : 'Find the best move'}
            </h2>
            {puzzle && status !== 'loading' ? (
              <>
                <span className="rounded bg-panel-soft px-1.5 py-0.5 text-[10px] font-bold text-ink-soft">
                  ~{puzzle.rating}
                </span>
                <span className="text-xs capitalize text-ink-soft">{puzzle.phase}</span>
                <span className="text-xs text-ink-soft">
                  · {puzzle.theme === 'mate' ? 'checkmate' : 'win material'}
                </span>
              </>
            ) : null}
          </header>

          <div className="max-h-[190px] overflow-y-auto p-3 text-sm">
            {status === 'loading' ? (
              <p className="text-ink-soft">{progress}</p>
            ) : status === 'empty' ? (
              <p className="text-ink-soft">
                No puzzle matched those settings. Widen the phase or move the rating, then try again.
              </p>
            ) : status === 'wrong' ? (
              <div>
                <p>
                  <span className="font-mono font-bold text-tag-mistake">{wrongMove}</span> is not
                  the move. There is something stronger here.
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  Use <span className="text-ink">Hint</span> for the piece to move, or{' '}
                  <span className="text-ink">Try again</span> to keep looking.
                </p>
              </div>
            ) : status === 'timeout' ? (
              <div>
                <p className="font-semibold text-tag-blunder">Time is up.</p>
                <p className="mt-1 text-xs text-ink-soft">
                  Press <span className="text-ink">Show solution</span> to see the idea, or{' '}
                  <span className="text-ink">Next puzzle</span> to move on.
                </p>
              </div>
            ) : status === 'solved' ? (
              <div>
                <p className="font-semibold text-tag-brilliant">
                  {usedHelp ? 'Correct — with a little help.' : 'Correct, first time.'}
                </p>
                <p className="mt-1 font-mono text-xs text-ink-soft">
                  {puzzle?.solutionSan.join(' ')}
                </p>
              </div>
            ) : status === 'revealed' ? (
              <div>
                <p className="font-mono text-sm">{puzzle?.solutionSan.join(' ')}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  Playing it out on the board. Press <span className="text-ink">Next puzzle</span>{' '}
                  when you have seen it.
                </p>
              </div>
            ) : (
              <p className="text-ink-soft">
                {puzzle?.sideToMove === 'w' ? 'White' : 'Black'} to play.{' '}
                {puzzle?.mateIn
                  ? `There is mate in ${puzzle.mateIn}.`
                  : 'There is a move here that wins material.'}{' '}
                Play it on the board.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* ---------- Side column ---------- */}
      <div className="flex flex-col gap-3">
        <Panel title="Your record" bodyClassName="p-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-bold">{settings.solved}</div>
              <div className="text-[10px] uppercase text-ink-soft">solved</div>
            </div>
            <div>
              <div className="text-lg font-bold">{accuracy === null ? '–' : `${accuracy}%`}</div>
              <div className="text-[10px] uppercase text-ink-soft">accuracy</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent">{settings.streak}</div>
              <div className="text-[10px] uppercase text-ink-soft">streak</div>
            </div>
            <div>
              <div className="text-lg font-bold">{settings.bestStreak}</div>
              <div className="text-[10px] uppercase text-ink-soft">best</div>
            </div>
          </div>
          {settings.attempted > 0 ? (
            <Button variant="ghost" onClick={() => dispatch(resetStats())} className="mt-3 w-full">
              Reset record
            </Button>
          ) : null}
        </Panel>

        <Panel title="Customise" bodyClassName="p-3 flex flex-col gap-3">
          <Field label={`Target difficulty: ~${settings.targetRating}`}>
            <input
              type="range"
              min={600}
              max={2600}
              step={50}
              value={settings.targetRating}
              onChange={(e) => dispatch(setTargetRating(Number(e.target.value)))}
              className="accent-accent"
            />
          </Field>
          <p className="-mt-1 text-[11px] leading-snug text-ink-soft">
            Estimated from how forcing the move is, how long the line runs and whether the key move
            is quiet. A guide, not a calibrated rating.
          </p>

          <Field label="Game phase">
            <Select value={settings.phase} onChange={(v) => dispatch(setPhase(v as PuzzlePhase))}>
              {PHASES.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Time limit">
            <Select value={settings.timeLimitId} onChange={(v) => dispatch(setTimeLimitId(v))}>
              {PUZZLE_LIMITS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Tactic type">
            <Select
              value={settings.theme}
              onChange={(v) => dispatch(setTheme(v as PuzzleTheme | 'any'))}
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </Select>
          </Field>

          <p className="text-[11px] leading-snug text-ink-soft">
            Settings apply to the next puzzle. Every position is generated fresh by the engine, so
            you will never be shown the same one twice.
          </p>
        </Panel>

        {puzzle && (status === 'solved' || status === 'revealed') ? (
          <Panel title="The line" bodyClassName="p-3">
            <div className="flex flex-wrap gap-1">
              {puzzle.solutionSan.map((san, i) => (
                <span
                  key={i}
                  className={`rounded px-1.5 py-0.5 font-mono text-sm ${
                    i % 2 === 0 ? 'bg-accent/20 text-ink' : 'text-ink-soft'
                  }`}
                >
                  {san}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Your moves are highlighted; the rest are the opponent's best replies.
            </p>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
