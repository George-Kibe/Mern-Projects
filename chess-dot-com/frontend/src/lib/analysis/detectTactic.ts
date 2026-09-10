import { Chess, type Color } from 'chess.js';
import type { StockfishAnalysis } from '../stockfish/engine';
import { PIECE_VALUE } from '../chess/describeMove';
import { pvToSan } from '../chess/describeMove';
import { isMateScore, scoreToCp } from './score';

export type Tactic =
  | {
      kind: 'mate';
      side: Color;
      /** Moves (not plies) until mate. */
      movesToMate: number;
      pv: string[];
      sans: string[];
    }
  | {
      kind: 'material';
      side: Color;
      /** Centipawns winnable beyond the material already on the board. */
      gainCp: number;
      pv: string[];
      sans: string[];
    };

/** Material the given side has on the board, in centipawns. */
function materialCp(chess: Chess, color: Color): number {
  let total = 0;
  for (const row of chess.board()) {
    for (const square of row) {
      if (!square || square.color !== color || square.type === 'k') continue;
      total += PIECE_VALUE[square.type] * 100;
    }
  }
  return total;
}

/**
 * Is there something concrete to win in this position?
 *
 * The engine's evaluation alone is not a tactic — being a rook up already scores
 * +500 with nothing to do about it. What matters is the advantage *available
 * beyond the material already on the board*, which is what a combination wins.
 */
export function detectTactic(
  fen: string,
  analysis: StockfishAnalysis | null,
  minGainCp = 150,
): Tactic | null {
  const top = analysis?.lines[0];
  if (!top || top.pv.length === 0) return null;

  const chess = new Chess();
  try {
    chess.load(fen);
  } catch {
    return null;
  }

  const side = chess.turn();
  const cp = scoreToCp(top.score);
  if (cp === null) return null;

  // Scores are White-POV; flip to the mover's point of view.
  const moverCp = side === 'w' ? cp : -cp;

  if (isMateScore(cp)) {
    if (moverCp < 0) return null; // being mated is not a tactic to play
    const sans = pvToSan(fen, top.pv, 12);
    const movesToMate =
      top.score.type === 'mate' ? Math.abs(top.score.value) : Math.ceil(sans.length / 2);
    return { kind: 'mate', side, movesToMate, pv: top.pv, sans };
  }

  const balanceCp = materialCp(chess, side) - materialCp(chess, side === 'w' ? 'b' : 'w');
  const gainCp = moverCp - balanceCp;
  if (gainCp < minGainCp) return null;

  return { kind: 'material', side, gainCp, pv: top.pv, sans: pvToSan(fen, top.pv, 10) };
}

/** Human-readable size of a material tactic. */
export function describeGain(gainCp: number): string {
  if (gainCp >= 850) return 'a queen';
  if (gainCp >= 450) return 'a rook';
  if (gainCp >= 250) return 'a piece';
  return 'a pawn or more';
}

export type TacticMoment = { ply: number; tactic: Tactic };

/**
 * Every point in the game where a tactic first becomes available.
 *
 * Once you are winning, the engine keeps reporting a tactic every move; listing
 * all of them buries the moment it actually appeared. Only transitions are kept.
 */
export function findTacticMoments(
  fens: string[],
  analyses: Array<StockfishAnalysis | null>,
  minGainCp = 150,
): TacticMoment[] {
  const moments: TacticMoment[] = [];

  // Tracked per side: the sides alternate, so comparing against the immediately
  // preceding position would treat one continuing tactic as a new one every
  // second ply.
  const lastKind: Record<Color, string | null> = { w: null, b: null };

  for (let ply = 0; ply < fens.length; ply++) {
    const side: Color = ply % 2 === 0 ? 'w' : 'b';
    const tactic = detectTactic(fens[ply], analyses[ply] ?? null, minGainCp);
    const kind = tactic ? tactic.kind : null;

    if (tactic && kind !== lastKind[side]) moments.push({ ply, tactic });
    lastKind[side] = kind;
  }

  return moments;
}
