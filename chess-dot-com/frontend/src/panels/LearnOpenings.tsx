import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { Board } from '../components/Board';
import { Button, Field, Panel, Select } from '../components/ui';
import { OPENINGS, FAMILIES, type Opening } from '../lib/openings/catalog';
import { describeMove } from '../lib/chess/describeMove';
import { getEngine } from '../lib/stockfish/pool';
import { useAppSelector } from '../store';
import { getLevel } from '../lib/stockfish/levels';

type Mode = 'learn' | 'practice';

/** Positions after each ply of an opening, index 0 being the start. */
function positionsFor(opening: Opening): { fens: string[]; moves: ReturnType<Chess['move']>[] } {
  const chess = new Chess();
  const fens = [chess.fen()];
  const moves: ReturnType<Chess['move']>[] = [];
  for (const san of opening.moves) {
    const mv = chess.move(san);
    moves.push(mv);
    fens.push(chess.fen());
  }
  return { fens, moves };
}

export function LearnOpenings({ onPlayFrom }: { onPlayFrom: (pgn: string, label: string) => void }) {
  const levelId = useAppSelector((s) => s.engine.levelId);

  const [openingId, setOpeningId] = useState<string>(OPENINGS[0].id);
  const [mode, setMode] = useState<Mode>('learn');
  const [ply, setPly] = useState(0);
  const [family, setFamily] = useState<string>('all');

  // Practice state
  const [wrong, setWrong] = useState<{ played: string; why: string } | null>(null);
  const [score, setScore] = useState({ right: 0, tries: 0 });
  const [freePlay, setFreePlay] = useState<Chess | null>(null);
  const [freeFen, setFreeFen] = useState<string | null>(null);
  // Tracked explicitly: the Chess object is mutated in place, so its identity
  // cannot tell React (or a memo) that the history has changed.
  const [freeLastMove, setFreeLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const engineBusy = useRef(false);

  const opening = useMemo(
    () => OPENINGS.find((o) => o.id === openingId) ?? OPENINGS[0],
    [openingId],
  );
  const { fens, moves } = useMemo(() => positionsFor(opening), [opening]);

  // Derived rather than stored: setting it from an effect just causes an extra render.
  const done = mode === 'practice' && ply >= opening.moves.length && !freePlay;

  const visible = useMemo(
    () => (family === 'all' ? OPENINGS : OPENINGS.filter((o) => o.family === family)),
    [family],
  );

  const reset = useCallback((id: string) => {
    setOpeningId(id);
    setPly(0);
    setWrong(null);
    setScore({ right: 0, tries: 0 });
    setFreePlay(null);
    setFreeFen(null);
    setFreeLastMove(null);
  }, []);

  // In practice mode the opponent replies on its own, so you only play your side.
  const yourTurn = opening.side === 'w' ? ply % 2 === 0 : ply % 2 === 1;

  useEffect(() => {
    if (mode !== 'practice' || done || freePlay) return;
    if (yourTurn || ply >= opening.moves.length) return;

    const timer = setTimeout(() => {
      setPly((p) => Math.min(p + 1, opening.moves.length));
    }, 550);
    return () => clearTimeout(timer);
  }, [mode, ply, yourTurn, done, opening.moves.length, freePlay]);

  /* ---------- free play against the engine from the final position ---------- */

  const startFreePlay = useCallback(() => {
    const chess = new Chess();
    for (const san of opening.moves) chess.move(san);
    setFreePlay(chess);
    setFreeFen(chess.fen());
    setFreeLastMove(null);
  }, [opening.moves]);

  useEffect(() => {
    if (!freePlay || !freeFen) return;
    const chess = freePlay;
    if (chess.isGameOver() || chess.turn() === opening.side || engineBusy.current) return;

    engineBusy.current = true;
    let cancelled = false;
    const level = getLevel(levelId);

    void (async () => {
      try {
        const uci = await getEngine('play').chooseMove({
          fen: chess.fen(),
          movetimeMs: level.movetimeMs,
          skillLevel: level.skillLevel,
          elo: level.elo,
        });
        if (cancelled || !uci) return;
        const mv = chess.move({
          from: uci.slice(0, 2),
          to: uci.slice(2, 4),
          promotion: uci.length >= 5 ? uci[4] : undefined,
        });
        if (mv) setFreeLastMove({ from: mv.from as Square, to: mv.to as Square });
        setFreeFen(chess.fen());
      } finally {
        engineBusy.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [freePlay, freeFen, opening.side, levelId]);

  /* ---------- the move you make on the board ---------- */

  function onMove(move: { from: Square; to: Square; promotion?: string }) {
    // Free play: anything legal goes.
    if (freePlay) {
      try {
        const mv = freePlay.move(move);
        if (!mv) return false;
        setFreeLastMove({ from: mv.from as Square, to: mv.to as Square });
      } catch {
        return false;
      }
      setFreeFen(freePlay.fen());
      return true;
    }

    if (mode !== 'practice' || !yourTurn || ply >= opening.moves.length) return false;

    const expected = moves[ply];
    if (!expected) return false;

    const correct =
      expected.from === move.from &&
      expected.to === move.to &&
      (expected.promotion ?? undefined) === (move.promotion ?? undefined);

    setScore((s) => ({ right: s.right + (correct ? 1 : 0), tries: s.tries + 1 }));

    if (correct) {
      setWrong(null);
      setPly((p) => p + 1);
      return true;
    }

    // Explain what was wrong with what they chose, from the board rather than a score.
    const insight = describeMove(fens[ply], `${move.from}${move.to}${move.promotion ?? ''}`);
    setWrong({
      played: insight?.san ?? `${move.from}${move.to}`,
      why: insight ? insight.headline : 'That is not the move this line plays.',
    });
    return false;
  }

  const displayedFen = freeFen ?? fens[Math.min(ply, fens.length - 1)];
  const lastMove = useMemo(() => {
    if (freePlay) return freeLastMove;
    const mv = ply > 0 ? moves[ply - 1] : null;
    return mv ? { from: mv.from as Square, to: mv.to as Square } : null;
  }, [freePlay, freeLastMove, moves, ply]);

  const note = opening.notes[ply - 1];
  const nextMoveSan = ply < opening.moves.length ? opening.moves[ply] : null;
  const finished = ply >= opening.moves.length;

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
      {/* ---------- Board column ---------- */}
      <div className="flex flex-col gap-3 xl:sticky xl:top-3">
        <div className="flex shrink-0 items-start gap-3">
          <Board
            fen={displayedFen}
            orientation={opening.side}
            interactive={Boolean(freePlay) || (mode === 'practice' && yourTurn && !finished)}
            onMove={onMove}
            lastMove={lastMove}
            maxSize="max-w-[min(54vh,520px)]"
            alert={
              freePlay
                ? null
                : done
                  ? { label: 'line complete', tone: 'good' }
                  : wrong
                    ? { label: 'not this move', tone: 'warning' }
                    : null
            }
          />
        </div>

        {/* Controls sit directly under the board, never below the explanation. */}
        {freePlay ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-soft">
              Playing on from the opening against {getLevel(levelId).name}.
            </span>
            <Button
              variant="ghost"
              onClick={() =>
                onPlayFrom(freePlay.pgn(), `${opening.name} — practice game`)
              }
            >
              Analyze this game
            </Button>
            <Button variant="ghost" onClick={() => reset(opening.id)}>
              Back to the line
            </Button>
          </div>
        ) : mode === 'learn' ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => setPly(0)} disabled={ply === 0}>⏮</Button>
            <Button variant="ghost" onClick={() => setPly((p) => Math.max(0, p - 1))} disabled={ply === 0}>◀</Button>
            <Button
              variant="primary"
              onClick={() => setPly((p) => Math.min(opening.moves.length, p + 1))}
              disabled={finished}
              className="min-w-[8rem]"
            >
              {finished ? 'End of line' : 'Next move ▶'}
            </Button>
            <Button variant="ghost" onClick={() => setPly(opening.moves.length)} disabled={finished}>⏭</Button>
            <span className="ml-auto text-xs text-ink-soft">
              {ply}/{opening.moves.length} · ← → also step
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => reset(opening.id)}>Restart</Button>
            {!finished ? (
              <Button
                variant="ghost"
                onClick={() => {
                  const mv = moves[ply];
                  if (mv) setWrong({ played: mv.san, why: `Play ${mv.san}. ${opening.notes[ply] ?? ''}`.trim() });
                }}
                disabled={!yourTurn}
              >
                Show me
              </Button>
            ) : null}
            <span className="ml-auto text-xs text-ink-soft">
              {score.tries > 0 ? `${score.right}/${score.tries} correct` : 'Play your move on the board'}
            </span>
          </div>
        )}

        {/* ---------- Explanation ---------- */}
        {!freePlay ? (
          <section className="overflow-hidden rounded-lg border border-line bg-panel">
            <header className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
              <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-black">
                {opening.eco}
              </span>
              <h2 className="text-sm font-semibold">{opening.name}</h2>
              <span className="text-xs text-ink-soft">
                you play {opening.side === 'w' ? 'White' : 'Black'}
              </span>
            </header>

            <div className="max-h-[230px] overflow-y-auto p-3 text-sm">
              {wrong ? (
                <div className="mb-2 rounded border border-tag-mistake/50 bg-tag-mistake/10 p-2">
                  <div className="font-semibold text-tag-mistake">Not {wrong.played}</div>
                  <div className="text-xs text-ink-soft">{wrong.why}</div>
                  <div className="mt-1 text-xs">
                    This line plays <span className="font-mono font-bold">{nextMoveSan}</span>
                    {opening.notes[ply] ? ` — ${opening.notes[ply]}` : ''}
                  </div>
                </div>
              ) : null}

              {done ? (
                <div className="mb-2 rounded border border-tag-brilliant/50 bg-tag-brilliant/10 p-2">
                  <div className="font-semibold text-tag-brilliant">Line complete</div>
                  <div className="text-xs text-ink-soft">
                    {score.tries > 0
                      ? `${score.right} of ${score.tries} first-time correct.`
                      : 'You played the whole line.'}{' '}
                    Now play it out against the engine to see the middlegame.
                  </div>
                  <Button variant="primary" onClick={startFreePlay} className="mt-2">
                    ▶ Play on from here
                  </Button>
                </div>
              ) : null}

              {ply === 0 ? (
                <p className="leading-relaxed">{opening.idea}</p>
              ) : note ? (
                <p className="leading-relaxed">
                  <span className="font-mono font-bold text-accent">
                    {Math.floor((ply - 1) / 2) + 1}
                    {(ply - 1) % 2 === 0 ? '.' : '…'} {opening.moves[ply - 1]}
                  </span>{' '}
                  — {note}
                </p>
              ) : (
                <p className="leading-relaxed text-ink-soft">
                  {ply > 0 ? (
                    <>
                      <span className="font-mono font-bold text-ink">{opening.moves[ply - 1]}</span>{' '}
                      — developing move, consistent with the plan.
                    </>
                  ) : null}
                </p>
              )}

              {finished && !done ? (
                <div className="mt-2">
                  <Button variant="primary" onClick={startFreePlay}>
                    ▶ Play on from here against the engine
                  </Button>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      {/* ---------- Side column ---------- */}
      <div className="flex flex-col gap-3">
        <Panel title="Openings" bodyClassName="p-3 flex flex-col gap-3">
          <div className="flex gap-1 rounded-lg border border-line bg-panel-soft p-1">
            {(['learn', 'practice'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  reset(opening.id);
                }}
                className={`flex-1 rounded px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  mode === m ? 'bg-accent text-black' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {m === 'learn' ? 'Learn' : 'Practise'}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-soft">
            {mode === 'learn'
              ? 'Step through the main line and read why each move is played.'
              : 'Play your side from memory. The opponent replies automatically and the coach explains anything you get wrong.'}
          </p>

          <Field label="Filter">
            <Select value={family} onChange={setFamily}>
              <option value="all">All openings</option>
              {FAMILIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </Select>
          </Field>
        </Panel>

        <Panel title={`${visible.length} lines`} bodyClassName="max-h-[300px] overflow-auto">
          <div className="flex flex-col divide-y divide-line">
            {visible.map((o) => (
              <button
                key={o.id}
                onClick={() => reset(o.id)}
                className={`px-3 py-2 text-left hover:bg-panel-soft ${
                  o.id === openingId ? 'bg-panel-soft' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-ink-soft">{o.eco}</span>
                  <span className="truncate text-sm font-medium">{o.name}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-ink-soft">
                    {o.side === 'w' ? 'White' : 'Black'}
                  </span>
                </div>
                <div className="truncate font-mono text-[11px] text-ink-soft">
                  {o.moves.slice(0, 6).join(' ')}
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Middlegame plans" bodyClassName="p-3">
          <ul className="flex flex-col gap-1.5">
            {opening.plans.map((plan, i) => (
              <li key={i} className="text-sm leading-snug">
                <span className="mr-1 text-accent">→</span>
                {plan}
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded border border-tag-mistake/40 bg-tag-mistake/10 p-2">
            <div className="text-xs font-semibold text-tag-mistake">Watch out</div>
            <p className="mt-0.5 text-xs leading-snug">{opening.watchOut}</p>
          </div>
        </Panel>

        <Panel title="The line" bodyClassName="p-3">
          <div className="flex flex-wrap gap-1">
            {opening.moves.map((san, i) => (
              <button
                key={i}
                onClick={() => {
                  if (mode === 'learn' && !freePlay) setPly(i + 1);
                }}
                className={`rounded px-1.5 py-0.5 font-mono text-sm ${
                  ply === i + 1 && !freePlay
                    ? 'bg-accent font-bold text-black'
                    : mode === 'practice' && i >= ply
                      ? 'text-ink-soft/40'
                      : 'text-ink-soft hover:bg-panel-soft hover:text-ink'
                }`}
                title={mode === 'practice' && i >= ply ? 'Hidden while you practise' : undefined}
              >
                {i % 2 === 0 ? `${i / 2 + 1}.` : ''}
                {mode === 'practice' && i >= ply ? '···' : san}
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
