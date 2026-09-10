import { Chess } from 'chess.js';
import type { MoveAnnotation, MoveTag } from './classifyMove';
import { describeMove, pvToSan } from '../chess/describeMove';
import { evalToSpeech, sanToSpeech } from '../speech/sanToSpeech';
import { isMateScore } from './score';

const TAG_PHRASE: Record<MoveTag, string> = {
  brilliant: 'a brilliant move',
  best: 'the best move',
  excellent: 'an excellent move',
  good: 'a reasonable move',
  inaccuracy: 'an inaccuracy',
  mistake: 'a mistake',
  blunder: 'a blunder',
};

const NEEDS_CORRECTION: ReadonlySet<MoveTag> = new Set(['inaccuracy', 'mistake', 'blunder']);

export type NarrationInput = {
  annotation: MoveAnnotation;
  /** Position the move was played from. */
  fenBefore: string;
  /** Engine's preferred move from that position, in UCI. */
  bestUci: string | null;
  /** Engine's main line from that position, in UCI. */
  pvUci: string[] | null;
};

/**
 * Full coaching narration for one move: what was played, how good it was, why,
 * and what to play instead. Written to be *heard*, so it avoids notation the
 * synthesiser would mangle and keeps sentences short.
 */
export function buildNarration({ annotation, fenBefore, bestUci, pvUci }: NarrationInput): string {
  const { ply, mover, san, tag, lossCp, evalAfterCp, missedChance } = annotation;

  const moveNo = Math.floor(ply / 2) + 1;
  const side = mover === 'w' ? 'White' : 'Black';

  const sentences: string[] = [];

  sentences.push(`${side}, move ${moveNo}: ${sanToSpeech(san)}. That is ${TAG_PHRASE[tag]}.`);

  // Why it earned that verdict.
  const played = describeMove(fenBefore, uciOfSan(fenBefore, san) ?? '');
  if (played && isSpecific(played.headline) && (tag === 'brilliant' || tag === 'best' || tag === 'excellent')) {
    sentences.push(played.headline);
  }

  // A move that walks into mate carries the mate sentinel, so the centipawn
  // figure would be meaningless — say what actually happened instead.
  const walksIntoMate =
    evalAfterCp !== null &&
    isMateScore(evalAfterCp) &&
    (mover === 'w' ? evalAfterCp < 0 : evalAfterCp > 0);

  if (walksIntoMate) {
    sentences.push('It allows a forced mate.');
  } else if (lossCp !== null && lossCp > 20 && NEEDS_CORRECTION.has(tag)) {
    const pawns = Math.min(lossCp, 900) / 100;
    sentences.push(`It costs about ${pawns.toFixed(1)} pawns of advantage.`);
  }

  if (missedChance) {
    sentences.push('You were clearly better here and let a large part of it slip.');
  }

  // What to play instead, and why — the part that actually teaches.
  if (bestUci && NEEDS_CORRECTION.has(tag)) {
    const better = describeMove(fenBefore, bestUci);
    if (better) {
      sentences.push(`Better was ${sanToSpeech(better.san)}.`);
      if (isSpecific(better.headline)) sentences.push(better.headline);

      const line = pvToSan(fenBefore, pvUci, 4);
      if (line.length > 1) {
        sentences.push(`The line runs ${line.map(sanToSpeech).join(', then ')}.`);
      }
    }
  }

  sentences.push(`After the move, ${evalToSpeech(evalAfterCp)}.`);

  return sentences.join(' ');
}

/**
 * The describer falls back to "Plays knight to f6" when it finds nothing
 * concrete to say; repeating that adds nothing to the narration.
 */
function isSpecific(headline: string): boolean {
  return Boolean(headline) && !headline.startsWith('Plays ');
}

/** Resolve a SAN move back to UCI so it can be re-described from the prior position. */
function uciOfSan(fen: string, san: string): string | null {
  try {
    const c = new Chess();
    c.load(fen);
    const mv = c.move(san);
    if (!mv) return null;
    return `${mv.from}${mv.to}${mv.promotion ?? ''}`;
  } catch {
    return null;
  }
}
