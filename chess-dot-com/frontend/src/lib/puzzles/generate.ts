import { Chess, type Color } from 'chess.js';
import { getEngine } from '../stockfish/pool';
import { pvToSan } from '../chess/describeMove';
import { isMateScore, scoreToCp } from '../analysis/score';

/**
 * Puzzles are generated rather than shipped as a fixed set.
 *
 * A bundled database repeats itself and dates; the engine is already here, so
 * positions are built on demand instead — a plausible game is played out, one
 * side is nudged into a mistake, and the resulting position is kept only if it
 * has a single clearly best answer. That makes every puzzle genuinely new.
 */
export type PuzzlePhase = 'opening' | 'middlegame' | 'endgame' | 'any';

export type PuzzleTheme = 'mate' | 'material';

export type Puzzle = {
  id: string;
  fen: string;
  /** The full winning line in UCI; you play indices 0, 2, 4 … */
  solution: string[];
  solutionSan: string[];
  sideToMove: Color;
  theme: PuzzleTheme;
  phase: Exclude<PuzzlePhase, 'any'>;
  /** Rough difficulty. A heuristic, not a calibrated rating. */
  rating: number;
  /** Centipawns between the best move and the next best. */
  gapCp: number;
  mateIn: number | null;
};

export type GenerateOptions = {
  phase: PuzzlePhase;
  /** Aim for puzzles near this difficulty. */
  targetRating: number;
  theme: PuzzleTheme | 'any';
  signal?: AbortSignal;
  onProgress?: (message: string) => void;
  /** FENs already served, so the same position is never repeated. */
  seen?: Set<string>;
};

const PHASE_PLIES: Record<Exclude<PuzzlePhase, 'any'>, [number, number]> = {
  opening: [6, 16],
  middlegame: [18, 36],
  endgame: [40, 60],
};

const FILES = 'abcdefgh';
const SQUARES = [...FILES].flatMap((f) => [1, 2, 3, 4, 5, 6, 7, 8].map((r) => `${f}${r}`));

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

/**
 * Build a random but legal endgame directly.
 *
 * Playing a full game down to an endgame took over a minute per puzzle and
 * usually ended in mate or a draw before getting there. Placing the pieces is
 * instant and gives far more variety of material.
 */
function randomEndgame(): Chess | null {
  const board = new Map<string, string>();
  const free = () => SQUARES.filter((sq) => !board.has(sq));

  const whiteKing = pick(free());
  board.set(whiteKing, 'K');

  // Kings may not stand next to each other.
  const notAdjacent = free().filter((sq) => {
    const df = Math.abs(sq.charCodeAt(0) - whiteKing.charCodeAt(0));
    const dr = Math.abs(Number(sq[1]) - Number(whiteKing[1]));
    return Math.max(df, dr) > 1;
  });
  if (notAdjacent.length === 0) return null;
  board.set(pick(notAdjacent), 'k');

  const addPieces = (count: number, white: boolean) => {
    for (let i = 0; i < count; i++) {
      const type = pick(['q', 'r', 'r', 'b', 'b', 'n', 'n', 'p', 'p', 'p']);
      // Pawns cannot sit on the back ranks.
      const candidates = free().filter((sq) => type !== 'p' || (sq[1] !== '1' && sq[1] !== '8'));
      if (candidates.length === 0) return;
      board.set(pick(candidates), white ? type.toUpperCase() : type);
    }
  };

  addPieces(1 + Math.floor(Math.random() * 4), true);
  addPieces(1 + Math.floor(Math.random() * 4), false);

  const rows: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    let row = '';
    let gap = 0;
    for (const file of FILES) {
      const piece = board.get(`${file}${rank}`);
      if (piece) {
        if (gap) row += gap;
        gap = 0;
        row += piece;
      } else {
        gap++;
      }
    }
    if (gap) row += gap;
    rows.push(row);
  }

  const turn: Color = Math.random() < 0.5 ? 'w' : 'b';
  const fen = `${rows.join('/')} ${turn} - - 0 1`;

  try {
    const chess = new Chess(fen);
    // The side that just moved must not still be in check — that is not a
    // position that could arise in a game.
    const enemy: Color = turn === 'w' ? 'b' : 'w';
    const enemyKing = chess
      .board()
      .flat()
      .find((sq) => sq && sq.type === 'k' && sq.color === enemy);
    if (enemyKing && chess.isAttacked(enemyKing.square, turn)) return null;
    if (chess.isGameOver()) return null;
    return chess;
  } catch {
    return null;
  }
}

function countPieces(chess: Chess): number {
  return chess
    .board()
    .flat()
    .filter((sq) => sq !== null).length;
}

function phaseOf(chess: Chess, ply: number): Exclude<PuzzlePhase, 'any'> {
  const pieces = countPieces(chess);
  if (pieces <= 12) return 'endgame';
  if (ply <= 16) return 'opening';
  return 'middlegame';
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError');
}

/** Pick one of the engine's top moves at random, for variety between games. */
function pickVaried(lines: Array<{ pv: string[] }>, spread: number): string | null {
  if (lines.length === 0) return null;
  const pool = lines.slice(0, Math.max(1, Math.min(spread, lines.length)));
  const choice = pool[Math.floor(Math.random() * pool.length)];
  return choice?.pv[0] ?? null;
}

/**
 * Estimate how hard a puzzle is.
 *
 * Deliberately a heuristic: a quiet key move is harder to see than a capture, a
 * longer forced line is harder than a one-move shot, and an enormous evaluation
 * gap usually means the answer is screaming at you.
 */
function estimateRating(params: {
  chess: Chess;
  solution: string[];
  firstMoveIsQuiet: boolean;
  gapCp: number;
  mateIn: number | null;
  pieces: number;
}): number {
  const { solution, firstMoveIsQuiet, gapCp, mateIn, pieces } = params;

  let rating = 850;
  rating += Math.max(0, Math.ceil(solution.length / 2) - 1) * 260;
  if (firstMoveIsQuiet) rating += 320;
  if (mateIn !== null) rating -= 80;
  rating += Math.max(0, pieces - 10) * 8;
  rating -= Math.min(gapCp, 900) / 8;

  return Math.max(600, Math.min(2600, Math.round(rating / 10) * 10));
}

/** Play a plausible game and stop at a position in the requested phase. */
async function playOut(
  targetPly: number,
  signal: AbortSignal | undefined,
  onProgress?: (m: string) => void,
): Promise<Chess | null> {
  const engine = getEngine('puzzle');
  const chess = new Chess();

  for (let ply = 0; ply < targetPly; ply++) {
    throwIfAborted(signal);
    if (chess.isGameOver()) break;

    if (ply % 8 === 0) onProgress?.(`Building a position… move ${Math.floor(ply / 2) + 1}`);

    const res = await engine.analyzePosition({
      fen: chess.fen(),
      movetimeMs: 45,
      multiPv: 3,
      signal,
    });

    // Early on, wander among the engine's top choices so no two puzzles start
    // from the same game; later, play more sensibly so the position holds up.
    const uci = pickVaried(res.lines, ply < 12 ? 3 : 2) ?? res.bestMove;
    if (!uci) break;

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

  return chess.isGameOver() ? null : chess;
}

/**
 * Is this position a puzzle? It is when one move is decisively better than
 * every alternative — otherwise there is nothing to find.
 */
async function evaluateCandidate(
  chess: Chess,
  options: GenerateOptions,
  ply: number,
): Promise<Puzzle | null> {
  const engine = getEngine('puzzle');
  const fen = chess.fen();

  const res = await engine.analyzePosition({
    fen,
    movetimeMs: 320,
    multiPv: 2,
    signal: options.signal,
  });

  const best = res.lines[0];
  const second = res.lines[1];
  if (!best || best.pv.length === 0) return null;

  const side = chess.turn();
  const toMover = (cp: number | null) => (cp === null ? null : side === 'w' ? cp : -cp);

  const bestCp = toMover(scoreToCp(best.score));
  const secondCp = second ? toMover(scoreToCp(second.score)) : null;
  if (bestCp === null) return null;

  // The solver must end up clearly better; otherwise there is nothing to win.
  // Opening tactics are smaller by nature, so the bar is lower there.
  const opening = ply <= 17;
  const minAdvantage = opening ? 140 : 180;
  const minGap = opening ? 150 : 180;

  if (bestCp < minAdvantage) return null;

  // And the alternatives must be meaningfully worse, or any move "works".
  const gapCp = secondCp === null ? 900 : Math.min(bestCp, 2000) - Math.min(secondCp, 2000);
  if (gapCp < minGap) return null;

  const mateIn =
    best.score.type === 'mate' && isMateScore(scoreToCp(best.score))
      ? Math.abs(best.score.value)
      : null;

  const theme: PuzzleTheme = mateIn !== null ? 'mate' : 'material';
  if (options.theme !== 'any' && options.theme !== theme) return null;

  // A mate puzzle must actually end in mate. Anything longer than four moves
  // gets truncated mid-attack, which reads as an unfinished puzzle.
  if (mateIn !== null && mateIn > 4) return null;

  // Ending on your own move means the line finishes with the mating blow.
  //
  // For material puzzles the length is the main difficulty lever, so it tracks
  // the requested rating: a fixed length made every puzzle score the same and
  // the target slider did almost nothing.
  const target = options.targetRating;
  const materialPlies = target < 1200 ? 3 : target < 1800 ? 5 : 7;
  const maxPlies = mateIn !== null ? mateIn * 2 - 1 : materialPlies;
  const solution = best.pv.slice(0, maxPlies);
  const solutionSan = pvToSan(fen, solution, maxPlies);
  if (solutionSan.length === 0) return null;

  const probe = new Chess(fen);
  const firstMove = probe.move({
    from: solution[0].slice(0, 2),
    to: solution[0].slice(2, 4),
    promotion: solution[0].length >= 5 ? solution[0][4] : undefined,
  });
  if (!firstMove) return null;
  const firstMoveIsQuiet = !firstMove.captured && !probe.isCheck() && !firstMove.promotion;

  const pieces = countPieces(chess);
  const phase = phaseOf(chess, ply);
  if (options.phase !== 'any' && options.phase !== phase) return null;

  const rating = estimateRating({
    chess,
    solution,
    firstMoveIsQuiet,
    gapCp,
    mateIn,
    pieces,
  });

  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    fen,
    solution,
    solutionSan,
    sideToMove: side,
    theme,
    phase,
    rating,
    gapCp,
    mateIn,
  };
}

/**
 * Build a puzzle matching the requested phase, theme and difficulty.
 *
 * Generation is probabilistic, so this retries; the closest match found is
 * returned rather than failing outright when the exact difficulty is elusive.
 */
export async function generatePuzzle(options: GenerateOptions): Promise<Puzzle | null> {
  const { signal, onProgress } = options;
  const tolerance = 250;
  let closest: Puzzle | null = null;

  const consider = (puzzle: Puzzle): Puzzle | null => {
    if (options.seen?.has(puzzle.fen)) return null;
    if (Math.abs(puzzle.rating - options.targetRating) <= tolerance) return puzzle;
    if (
      !closest ||
      Math.abs(puzzle.rating - options.targetRating) < Math.abs(closest.rating - options.targetRating)
    ) {
      closest = puzzle;
    }
    return null;
  };

  for (let attempt = 0; attempt < 8; attempt++) {
    throwIfAborted(signal);
    onProgress?.(attempt === 0 ? 'Generating a puzzle…' : `Looking for a better fit… (${attempt + 1})`);

    const phase: Exclude<PuzzlePhase, 'any'> =
      options.phase === 'any'
        ? (['opening', 'middlegame', 'endgame'] as const)[Math.floor(Math.random() * 3)]
        : options.phase;

    if (phase === 'endgame') {
      onProgress?.('Setting up an endgame…');
      // Cheap to build, so try a handful before falling back to another attempt.
      for (let k = 0; k < 6; k++) {
        throwIfAborted(signal);
        const position = randomEndgame();
        if (!position) continue;
        const puzzle = await evaluateCandidate(position, options, 40);
        if (puzzle) {
          const hit = consider(puzzle);
          if (hit) return hit;
        }
      }
      continue;
    }

    const [lo, hi] = PHASE_PLIES[phase];
    const targetPly = lo + Math.floor(Math.random() * (hi - lo));

    const base = await playOut(targetPly, signal, onProgress);
    if (!base) continue;
    const baseFen = base.fen();

    // Reuse the same game for several candidate mistakes. Building the position
    // is the expensive part, so testing one blunder per playout wasted most of
    // the work and rarely found anything.
    onProgress?.('Looking for a tactic…');
    for (let k = 0; k < 5; k++) {
      throwIfAborted(signal);

      const probe = new Chess(baseFen);
      const legal = probe.moves({ verbose: true });
      if (legal.length === 0) break;

      const mv = pick(legal);
      try {
        if (!probe.move({ from: mv.from, to: mv.to, promotion: mv.promotion })) continue;
      } catch {
        continue;
      }
      if (probe.isGameOver()) continue;

      const puzzle = await evaluateCandidate(probe, options, targetPly + 1);
      if (!puzzle) continue;

      const hit = consider(puzzle);
      if (hit) return hit;
    }
  }

  return closest;
}

/**
 * Turn a blunder from one of your own games into a puzzle.
 *
 * These are the most valuable tactics you can practise: positions you have
 * already failed to solve once, over the board.
 */
export function puzzleFromPosition(
  fen: string,
  solution: string[],
  rating: number,
): Puzzle | null {
  const chess = new Chess();
  try {
    chess.load(fen);
  } catch {
    return null;
  }
  if (solution.length === 0) return null;

  const solutionSan = pvToSan(fen, solution, 5);
  if (solutionSan.length === 0) return null;

  return {
    id: `own-${Math.random().toString(36).slice(2, 8)}`,
    fen,
    solution: solution.slice(0, 5),
    solutionSan,
    sideToMove: chess.turn(),
    theme: 'material',
    phase: phaseOf(chess, 30),
    rating,
    gapCp: 0,
    mateIn: null,
  };
}
