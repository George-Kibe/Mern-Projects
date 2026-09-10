import type { StockfishScore } from '../stockfish/engine';

/** Sentinel used so forced mates order correctly against centipawn values. */
export const MATE_CP = 100_000;
const MATE_THRESHOLD = 90_000;

/** Collapse an engine score into a single White-POV centipawn number. */
export function scoreToCp(score: StockfishScore | null | undefined): number | null {
  if (!score) return null;
  if (score.type === 'mate') {
    // Preserve "sooner mate is better" ordering within the sentinel band.
    const distance = Math.min(Math.abs(score.value), 99);
    return Math.sign(score.value) * (MATE_CP - distance);
  }
  return score.value;
}

export function isMateScore(cp: number | null): boolean {
  return cp !== null && Math.abs(cp) >= MATE_THRESHOLD;
}

/** "+1.24", "-0.35", "M4" — the way an eval is normally written. */
export function formatCp(cp: number | null): string {
  if (cp === null) return '–';
  if (isMateScore(cp)) {
    const moves = MATE_CP - Math.abs(cp);
    return `${cp > 0 ? '' : '-'}M${Math.max(1, moves)}`;
  }
  const pawns = cp / 100;
  return `${pawns >= 0 ? '+' : ''}${pawns.toFixed(2)}`;
}

/**
 * White's expected score, 0-1. Used for the eval bar, because raw centipawns
 * grow without bound and make the bar useless once someone is clearly winning.
 */
export function cpToWinProbability(cp: number | null): number {
  if (cp === null) return 0.5;
  if (isMateScore(cp)) return cp > 0 ? 1 : 0;
  return 1 / (1 + Math.exp(-cp / 350));
}

/**
 * Game accuracy from average centipawn loss, on the familiar 0-100 scale.
 * The curve is the widely used ACPL fit — it is a convention, not a measurement.
 */
export function accuracyFromLosses(losses: Array<number | null>): number | null {
  // Clamp each loss: a move that walks into mate scores ~100000cp via the
  // sentinel, which would otherwise swamp the average and zero the whole game.
  const real = losses
    .filter((l): l is number => l !== null)
    .map((l) => Math.max(0, Math.min(l, 1000)));
  if (real.length === 0) return null;

  const acpl = real.reduce((sum, l) => sum + l, 0) / real.length;
  const raw = 103.1668 * Math.exp(-0.04354 * (acpl / 10)) - 3.1669;
  return Math.max(0, Math.min(100, raw));
}
