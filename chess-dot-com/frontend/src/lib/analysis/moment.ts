import type { MoveAnnotation } from './classifyMove';
import type { StockfishAnalysis } from '../stockfish/engine';
import { detectTactic, describeGain } from './detectTactic';
import { describeMove, pvToSan } from '../chess/describeMove';
import { formatCp, isMateScore, scoreToCp } from './score';

/**
 * A line the user can play out to see *why* something is true.
 *
 * The justification is the whole point: "that was a blunder" teaches nothing on
 * its own, but walking through the refutation does.
 */
export type MomentLine = {
  id: string;
  label: string;
  /** Position index the line starts from. */
  fromPly: number;
  pv: string[];
  /** One-line summary of what this line demonstrates. */
  hint: string;
};

export type MomentKind =
  | 'blunder'
  | 'mistake'
  | 'inaccuracy'
  | 'brilliant'
  | 'mate'
  | 'tactic'
  | 'missed';

export type Moment = {
  kind: MomentKind;
  /** Drives colour and how loudly it is announced. */
  tone: 'critical' | 'warning' | 'good' | 'info';
  /** Short board badge, e.g. "BLUNDER" or "MATE IN 3". */
  badge: string;
  title: string;
  why: string;
  lines: MomentLine[];
};

const TONE: Record<MomentKind, Moment['tone']> = {
  blunder: 'critical',
  mistake: 'warning',
  inaccuracy: 'warning',
  missed: 'warning',
  brilliant: 'good',
  mate: 'critical',
  tactic: 'info',
};

function moveLabel(ply: number): string {
  const no = Math.floor(ply / 2) + 1;
  return ply % 2 === 0 ? `${no}.` : `${no}…`;
}

/**
 * Work out what there is to learn at the position currently on screen.
 *
 * Two things are considered: the move that was just played (was it a mistake, or
 * something brilliant?) and the position itself (is there a win available right
 * now?). The most instructive of the two wins.
 */
export function detectMoment(params: {
  ply: number;
  fens: string[];
  sanMoves: string[];
  annotations: MoveAnnotation[];
  analyses: Array<StockfishAnalysis | null>;
}): Moment | null {
  const { ply, fens, sanMoves, annotations, analyses } = params;

  const here = analyses[ply] ?? null;
  const previous = ply > 0 ? (analyses[ply - 1] ?? null) : null;
  const annotation = ply > 0 ? annotations[ply - 1] : undefined;

  const lines: MomentLine[] = [];

  // --- The move that was just played ---
  if (annotation && previous && here) {
    const playedFrom = ply - 1;
    const bestUci = previous.bestMove;
    const better = bestUci ? describeMove(fens[playedFrom], bestUci) : null;

    // What the opponent gets to do about it, from the position now on the board.
    if (here.pv && here.pv.length > 0) {
      lines.push({
        id: 'punish',
        label: 'What it allows',
        fromPly: ply,
        pv: here.pv,
        hint: 'The engine’s best continuation from the position in front of you.',
      });
    }

    // What should have been played instead.
    if (previous.pv && previous.pv.length > 0 && better) {
      lines.push({
        id: 'better',
        label: `Play ${better.san} instead`,
        fromPly: playedFrom,
        pv: previous.pv,
        hint: better.headline,
      });
    }

    const sideName = annotation.mover === 'w' ? 'White' : 'Black';
    const cost =
      annotation.lossCp !== null ? (Math.min(annotation.lossCp, 900) / 100).toFixed(1) : null;

    const walksIntoMate =
      annotation.evalAfterCp !== null &&
      isMateScore(annotation.evalAfterCp) &&
      (annotation.mover === 'w' ? annotation.evalAfterCp < 0 : annotation.evalAfterCp > 0);

    if (annotation.tag === 'blunder' || annotation.tag === 'mistake') {
      const whyParts: string[] = [];
      whyParts.push(
        walksIntoMate
          ? `${sideName} allows a forced mate.`
          : `${sideName} gives away about ${cost ?? '?'} pawns (now ${formatCp(annotation.evalAfterCp)}).`,
      );
      if (better) whyParts.push(`${better.san} was the move — ${better.headline}`);

      return {
        kind: annotation.tag,
        tone: TONE[annotation.tag],
        badge: annotation.tag === 'blunder' ? 'BLUNDER' : 'MISTAKE',
        title: `${annotation.tag === 'blunder' ? 'Blunder' : 'Mistake'} — ${moveLabel(playedFrom)} ${sanMoves[playedFrom]}`,
        why: whyParts.join(' '),
        lines,
      };
    }

    if (annotation.tag === 'brilliant') {
      return {
        kind: 'brilliant',
        tone: 'good',
        badge: 'BRILLIANT',
        title: `Brilliant — ${moveLabel(playedFrom)} ${sanMoves[playedFrom]}`,
        why: 'Material was given up and the position improved anyway. Play the line out to see what it buys.',
        lines,
      };
    }

    if (annotation.missedChance) {
      return {
        kind: 'missed',
        tone: 'warning',
        badge: 'MISSED WIN',
        title: `Missed chance — ${moveLabel(playedFrom)} ${sanMoves[playedFrom]}`,
        why: `${sideName} was clearly better here and let much of it slip.`,
        lines,
      };
    }
  }

  // --- Something available in the position right now ---
  const tactic = detectTactic(fens[ply], here);
  if (tactic) {
    const winner = tactic.side === 'w' ? 'White' : 'Black';
    const tacticLine: MomentLine[] = [
      {
        id: 'tactic',
        label: tactic.kind === 'mate' ? 'Show the mate' : 'Show the winning line',
        fromPly: ply,
        pv: tactic.pv,
        hint: pvToSan(fens[ply], tactic.pv, 4).join(' '),
      },
      ...lines.filter((l) => l.id === 'better'),
    ];

    if (tactic.kind === 'mate') {
      return {
        kind: 'mate',
        tone: 'critical',
        badge: `MATE IN ${tactic.movesToMate}`,
        title: `Forced mate in ${tactic.movesToMate} for ${winner}`,
        why: `Every ${winner === 'White' ? 'Black' : 'White'} reply loses. Step through it to see how the net closes.`,
        lines: tacticLine,
      };
    }

    return {
      kind: 'tactic',
      tone: 'info',
      badge: 'TACTIC',
      title: `${winner} can win ${describeGain(tactic.gainCp)}`,
      why: 'There is material to be won here beyond what is already on the board.',
      lines: tacticLine,
    };
  }

  // --- Inaccuracy is worth a quiet note, but only if there is something to show ---
  if (annotation?.tag === 'inaccuracy' && lines.length > 0) {
    const better = lines.find((l) => l.id === 'better');
    return {
      kind: 'inaccuracy',
      tone: 'warning',
      badge: 'INACCURACY',
      title: `Inaccuracy — ${moveLabel(ply - 1)} ${sanMoves[ply - 1]}`,
      why: better ? `${better.label.replace('Play ', '').replace(' instead', '')} was more precise.` : 'There was a more precise move.',
      lines,
    };
  }

  return null;
}

/** Every ply in the game that is worth stopping at, for jump-to navigation. */
export function findMoments(params: {
  fens: string[];
  sanMoves: string[];
  annotations: MoveAnnotation[];
  analyses: Array<StockfishAnalysis | null>;
}): Array<{ ply: number; moment: Moment }> {
  const out: Array<{ ply: number; moment: Moment }> = [];

  // Once someone is winning the engine reports a tactic on essentially every
  // move. Tracked per side, so only the ply where one becomes available is
  // listed — otherwise the list buries the mistakes that caused it.
  const lastTactic: Record<'w' | 'b', string | null> = { w: null, b: null };

  for (let ply = 0; ply < params.fens.length; ply++) {
    const moment = detectMoment({ ...params, ply });
    const side: 'w' | 'b' = ply % 2 === 0 ? 'w' : 'b';

    if (!moment) {
      lastTactic[side] = null;
      continue;
    }


    // Track the tactic independently of which moment type won: a blunder is
    // reported in preference to the tactic it created, and resetting the run on
    // it would re-list the same tactic on the very next move.
    const standing = detectTactic(params.fens[ply], params.analyses[ply] ?? null);
    const tacticKey = standing ? `${standing.kind}:${standing.side}` : null;
    const repeatTactic = tacticKey !== null && tacticKey === lastTactic[side];
    lastTactic[side] = tacticKey;

    if ((moment.kind === 'tactic' || moment.kind === 'mate') && repeatTactic) continue;

    out.push({ ply, moment });
  }

  return out;
}

export function momentScoreLabel(analysis: StockfishAnalysis | null): string {
  return formatCp(scoreToCp(analysis?.score ?? null));
}
