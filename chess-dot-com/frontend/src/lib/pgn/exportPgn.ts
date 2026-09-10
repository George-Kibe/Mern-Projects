import { Chess } from 'chess.js';
import type { MoveAnnotation } from '../analysis/classifyMove';
import { formatCp, isMateScore } from '../analysis/score';
import type { ParsedPgn } from './parsePgn';

/** Standard PGN suffix for a move-quality tag. */
const TAG_SUFFIX: Record<string, string> = {
  brilliant: '!!',
  best: '!',
  excellent: '',
  good: '',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
};

/**
 * Rebuild the game as PGN, folding the engine's verdicts into move comments.
 *
 * Comments are the portable way to carry analysis: Lichess, SCID and ChessBase
 * all keep them, so a downloaded game still explains itself months later.
 */
export function buildAnnotatedPgn(
  game: ParsedPgn,
  annotations: MoveAnnotation[],
  extraHeaders: Record<string, string> = {},
): string {
  const startFen = game.fens[0];
  const chess = new Chess();
  try {
    chess.load(startFen);
  } catch {
    chess.reset();
  }

  for (const [key, value] of Object.entries({ ...game.headers, ...extraHeaders })) {
    if (value) chess.setHeader(key, value);
  }

  game.sanMoves.forEach((san, ply) => {
    try {
      if (!chess.move(san)) return;
    } catch {
      return;
    }

    const ann = annotations[ply];
    if (!ann) return;

    const parts: string[] = [];
    const suffix = TAG_SUFFIX[ann.tag] ?? '';
    parts.push(suffix ? `${ann.tag} ${suffix}` : ann.tag);

    if (ann.evalAfterCp !== null) parts.push(formatCp(ann.evalAfterCp));

    // A move that walks into mate carries the ±100000 sentinel, so its
    // centipawn "loss" is meaningless — describe it instead.
    const walksIntoMate =
      ann.evalAfterCp !== null &&
      isMateScore(ann.evalAfterCp) &&
      (ann.mover === 'w' ? ann.evalAfterCp < 0 : ann.evalAfterCp > 0);

    if (walksIntoMate) {
      parts.push('allows forced mate');
    } else if (ann.lossCp !== null && ann.lossCp > 20 && !isMateScore(ann.evalBeforeCp)) {
      parts.push(`-${Math.round(Math.min(ann.lossCp, 900))}cp`);
    }
    if (ann.missedChance) parts.push('missed chance');

    chess.setComment(parts.join(' | '));
  });

  return chess.pgn();
}

/** Trigger a download of `text` as a file. */
export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/x-chess-pgn;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** A filesystem-safe filename derived from a game label. */
export function pgnFilename(label: string): string {
  const slug =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'game';
  const stamp = new Date().toISOString().slice(0, 10);
  return `${slug}-${stamp}.pgn`;
}
