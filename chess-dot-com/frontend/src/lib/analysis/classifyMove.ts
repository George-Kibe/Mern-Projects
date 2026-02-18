import { Chess, type PieceSymbol } from 'chess.js';

export type MoveTag =
  | 'brilliant'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

export type MoveAnnotation = {
  ply: number; // 0-based ply index
  mover: 'w' | 'b';
  san: string;
  evalBeforeCp: number | null; // White POV
  evalAfterCp: number | null; // White POV
  lossCp: number | null; // from mover POV, positive = worse
  tag: MoveTag;
  missedChance: boolean;
  explanation: string;
};

const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function materialByColor(fen: string): { w: number; b: number } {
  const c = new Chess();
  c.load(fen);
  let w = 0;
  let b = 0;
  for (const row of c.board()) {
    for (const sq of row) {
      if (!sq) continue;
      const v = PIECE_VALUE[sq.type];
      if (sq.color === 'w') w += v;
      else b += v;
    }
  }
  return { w, b };
}

function moverOfPly(ply: number): 'w' | 'b' {
  return ply % 2 === 0 ? 'w' : 'b';
}

function lossFromMoverPerspectiveCp(
  mover: 'w' | 'b',
  evalBeforeCp: number | null,
  evalAfterCp: number | null,
): number | null {
  if (evalBeforeCp === null || evalAfterCp === null) return null;
  // evals are White POV.
  // If mover is White: losing advantage => eval goes down.
  // If mover is Black: losing advantage => eval goes up.
  return mover === 'w' ? evalBeforeCp - evalAfterCp : evalAfterCp - evalBeforeCp;
}

function moverAdvantageCp(mover: 'w' | 'b', evalCp: number | null): number | null {
  if (evalCp === null) return null;
  return mover === 'w' ? evalCp : -evalCp;
}

function classifyLoss(lossCp: number | null): MoveTag {
  if (lossCp === null) return 'good';
  if (lossCp <= 5) return 'best';
  if (lossCp <= 20) return 'excellent';
  if (lossCp <= 80) return 'good';
  if (lossCp <= 200) return 'inaccuracy';
  if (lossCp <= 350) return 'mistake';
  return 'blunder';
}

function uciMoveToSanFromFen(fen: string, uci: string): string | null {
  if (uci.length < 4) return null;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length >= 5 ? uci[4] : undefined;

  try {
    const c = new Chess();
    c.load(fen);
    const mv = c.move({ from, to, promotion });
    return mv?.san ?? null;
  } catch {
    return null;
  }
}

function pvToSanLineFromFen(fen: string, pv: string[] | null, maxPlies = 8): string | null {
  if (!pv || pv.length === 0) return null;

  const c = new Chess();
  try {
    c.load(fen);
  } catch {
    return null;
  }

  const out: string[] = [];
  for (const uci of pv.slice(0, maxPlies)) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length >= 5 ? uci[4] : undefined;
    const mv = c.move({ from, to, promotion });
    if (!mv) break;
    out.push(mv.san);
  }

  return out.length ? out.join(' ') : null;
}

function formatCpShort(evalCp: number | null): string {
  if (evalCp === null) return '…';
  if (Math.abs(evalCp) >= 90000) return evalCp > 0 ? 'Mate (White)' : 'Mate (Black)';
  return (evalCp / 100).toFixed(2);
}

export function annotateMoves(params: {
  sanMoves: string[];
  fens: string[]; // positions: length = sanMoves.length + 1
  evalsCp: Array<number | null>; // evaluations for each position (White POV)
  bestMoveUciByPosition?: Array<string | null>; // length = fens.length
  pvUciByPosition?: Array<string[] | null>; // length = fens.length
}): MoveAnnotation[] {
  const { sanMoves, fens, evalsCp, bestMoveUciByPosition, pvUciByPosition } = params;
  const out: MoveAnnotation[] = [];

  for (let ply = 0; ply < sanMoves.length; ply++) {
    const mover = moverOfPly(ply);
    const san = sanMoves[ply];

    const evalBeforeCp = evalsCp[ply] ?? null;
    const evalAfterCp = evalsCp[ply + 1] ?? null;

    const lossCp = lossFromMoverPerspectiveCp(mover, evalBeforeCp, evalAfterCp);

    const advBefore = moverAdvantageCp(mover, evalBeforeCp);

    // Missed chance: you had a clear advantage and gave a lot of it away.
    const missedChance = advBefore !== null && advBefore >= 150 && lossCp !== null && lossCp >= 80;

    let tag = classifyLoss(lossCp);

    // Approx "brilliant": sacrifice material (>= 3 points) and improve eval.
    // This is a heuristic placeholder until we implement deeper PV-based tactics detection.
    const matBefore = materialByColor(fens[ply]);
    const matAfter = materialByColor(fens[ply + 1]);
    const moverMatDelta = mover === 'w' ? matAfter.w - matBefore.w : matAfter.b - matBefore.b;

    const deltaCpMover = lossCp === null ? null : -lossCp;
    const isSac = moverMatDelta <= -3;
    const improved = deltaCpMover !== null && deltaCpMover >= 80;

    if (isSac && improved) {
      tag = 'brilliant';
    }

    const bestUci = bestMoveUciByPosition?.[ply] ?? null;
    const pvUci = pvUciByPosition?.[ply] ?? null;

    const bestSan = bestUci ? uciMoveToSanFromFen(fens[ply], bestUci) : null;
    const pvSan = pvToSanLineFromFen(fens[ply], pvUci, 8);

    const explParts: string[] = [];

    if (lossCp === null) {
      explParts.push('Engine eval not available yet for this move.');
    } else {
      explParts.push(`Eval ${formatCpShort(evalBeforeCp)} → ${formatCpShort(evalAfterCp)}.`);

      if (lossCp <= 0) {
        explParts.push('This keeps (or improves) your position.');
      } else {
        explParts.push(`You lose about ${Math.round(lossCp)} centipawns.`);
      }

      if (tag === 'inaccuracy') {
        explParts.push('There was a more precise continuation.');
      } else if (tag === 'mistake') {
        explParts.push('This allows your opponent to gain a clear advantage.');
      } else if (tag === 'blunder') {
        explParts.push('This likely loses decisive material or the game with best play.');
      } else if (tag === 'best') {
        explParts.push('Engine-approved: this is essentially best.');
      } else if (tag === 'excellent') {
        explParts.push('Very strong: close to the engine’s top choice.');
      }
    }

    if (bestSan && tag !== 'best' && tag !== 'brilliant') {
      explParts.push(`Recommended: ${bestSan}.`);
    }

    if (pvSan && (tag === 'inaccuracy' || tag === 'mistake' || tag === 'blunder' || missedChance)) {
      explParts.push(`Best line: ${pvSan}.`);
    }

    if (missedChance) {
      explParts.push('You were clearly better here, but missed a stronger continuation.');
    }

    if (tag === 'brilliant') {
      explParts.push('Heuristic: material sacrifice with a significant evaluation improvement.');
      if (pvSan) explParts.push(`Best line: ${pvSan}.`);
    }

    out.push({
      ply,
      mover,
      san,
      evalBeforeCp,
      evalAfterCp,
      lossCp,
      tag,
      missedChance,
      explanation: explParts.join(' '),
    });
  }

  return out;
}

export function formatEvalCp(evalCp: number | null): string {
  if (evalCp === null) return '…';

  // If we used a "mate" sentinel (from Stockfish score mate), show that instead of clamping.
  if (Math.abs(evalCp) >= 90000) {
    return evalCp > 0 ? 'Mate (White)' : 'Mate (Black)';
  }

  // clamp for display
  const x = Math.max(-999, Math.min(999, evalCp));
  return (x / 100).toFixed(2);
}
