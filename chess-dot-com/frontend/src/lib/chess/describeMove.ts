import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';

export const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100,
};

export const PIECE_NAME: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

const CENTER: ReadonlySet<string> = new Set(['d4', 'e4', 'd5', 'e5']);
const BIG_CENTER: ReadonlySet<string> = new Set([
  'c3', 'd3', 'e3', 'f3', 'c4', 'd4', 'e4', 'f4',
  'c5', 'd5', 'e5', 'f5', 'c6', 'd6', 'e6', 'f6',
]);

export type MoveInsight = {
  uci: string;
  san: string;
  /** One-line summary of the move's point. */
  headline: string;
  /** Supporting observations, most important first. */
  facts: string[];
};

function otherColor(c: Color): Color {
  return c === 'w' ? 'b' : 'w';
}

/** Squares holding enemy pieces that the piece on `from` currently attacks. */
function targetsOf(chess: Chess, from: Square, mover: Color): Square[] {
  const enemy = otherColor(mover);
  const out: Square[] = [];
  for (const row of chess.board()) {
    for (const sq of row) {
      if (!sq || sq.color !== enemy) continue;
      if (chess.attackers(sq.square, mover).includes(from)) out.push(sq.square);
    }
  }
  return out;
}

/**
 * A piece is "loose" if the enemy attacks it and either nothing defends it, or
 * the cheapest attacker is worth less than the piece itself.
 */
function isLoose(chess: Chess, square: Square): boolean {
  const piece = chess.get(square);
  if (!piece || piece.type === 'k') return false;

  const attackers = chess.attackers(square, otherColor(piece.color));
  if (attackers.length === 0) return false;

  const defenders = chess.attackers(square, piece.color);
  if (defenders.length === 0) return true;

  const cheapestAttacker = Math.min(
    ...attackers.map((sq) => PIECE_VALUE[chess.get(sq)?.type ?? 'p']),
  );
  return cheapestAttacker < PIECE_VALUE[piece.type];
}

function looseSquares(chess: Chess, color: Color): Square[] {
  const out: Square[] = [];
  for (const row of chess.board()) {
    for (const sq of row) {
      if (!sq || sq.color !== color) continue;
      if (isLoose(chess, sq.square)) out.push(sq.square);
    }
  }
  return out;
}

/** "the rook on a8" — for talking about a specific piece. */
function namePieceAt(chess: Chess, square: Square): string {
  const p = chess.get(square);
  if (!p) return `the piece on ${square}`;
  return `the ${PIECE_NAME[p.type]} on ${square}`;
}

function backRank(color: Color): string {
  return color === 'w' ? '1' : '8';
}

/** Facts are rendered as sentences, so they start with a capital. */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * Explain in words what a candidate move actually does in the given position.
 *
 * Everything here is derived from the real board — captures, threats created,
 * pieces left loose, escapes — rather than from the engine's evaluation, so it
 * stays meaningful for alternatives the engine merely tolerates.
 */
export function describeMove(fenBefore: string, uci: string): MoveInsight | null {
  const before = new Chess();
  try {
    before.load(fenBefore);
  } catch {
    return null;
  }

  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = uci.length >= 5 ? uci[4] : undefined;

  const moverColor = before.turn();
  const movedPiece = before.get(from);
  if (!movedPiece) return null;

  const after = new Chess();
  after.load(fenBefore);

  let move;
  try {
    move = after.move({ from, to, promotion });
  } catch {
    return null;
  }
  if (!move) return null;
  // Only reachable from an illegal position; describing it would be nonsense.
  if (move.captured === 'k') return null;

  const facts: string[] = [];
  let headline = '';

  const movedName = PIECE_NAME[movedPiece.type];

  // --- Terminal states trump everything else ---
  if (after.isCheckmate()) {
    return {
      uci,
      san: move.san,
      headline: 'Checkmate.',
      facts: ['The game ends immediately.'],
    };
  }
  if (after.isStalemate()) {
    return {
      uci,
      san: move.san,
      headline: 'Stalemate — the game is drawn.',
      facts: ['The opponent has no legal move and is not in check.'],
    };
  }

  // --- Captures and material ---
  if (move.captured) {
    const capturedName = PIECE_NAME[move.captured];
    const capturedValue = PIECE_VALUE[move.captured];
    const recapturers = after.attackers(to, otherColor(moverColor));

    if (recapturers.length === 0) {
      headline = `Wins a ${capturedName} for free.`;
      facts.push(`Nothing recaptures on ${to}.`);
    } else {
      const ourValue = PIECE_VALUE[move.promotion ?? movedPiece.type];
      if (capturedValue > ourValue) {
        headline = `Wins material: ${capturedName} for ${movedName}.`;
      } else if (capturedValue === ourValue) {
        headline = `Trades ${movedName}s on ${to}.`;
      } else {
        headline = `Captures the ${capturedName} on ${to}.`;
      }
      facts.push(capitalize(`${joinList(recapturers.map((sq) => namePieceAt(after, sq)))} can recapture.`));
    }
  }

  // --- Castling, promotion, check ---
  if (move.flags.includes('k') || move.flags.includes('q')) {
    headline = move.flags.includes('k') ? 'Castles kingside.' : 'Castles queenside.';
    facts.push('Gets the king to safety and connects the rooks.');
  }

  if (move.promotion) {
    const promoted = PIECE_NAME[move.promotion];
    headline = `Promotes to a ${promoted}.`;
    facts.push(`The pawn reaches ${to} and becomes a ${promoted}.`);
  }

  if (after.isCheck()) {
    facts.unshift('Gives check, so the reply is forced.');
    if (!headline) headline = 'Checks the king.';
  }

  // --- Threats created by the piece that moved ---
  const landedSquare = to;
  const targets = targetsOf(after, landedSquare, moverColor);
  const movedValueAfter = PIECE_VALUE[move.promotion ?? movedPiece.type];

  const seriousTargets = targets.filter((sq) => {
    const p = after.get(sq);
    if (!p || p.type === 'k') return false;
    const defended = after.attackers(sq, otherColor(moverColor)).length > 0;
    return PIECE_VALUE[p.type] > movedValueAfter || !defended;
  });

  if (seriousTargets.length >= 2) {
    const names = seriousTargets.map((sq) => namePieceAt(after, sq));
    facts.unshift(`Forks ${joinList(names)}.`);
    if (!move.captured) headline = `Forks ${seriousTargets.length} pieces.`;
  } else if (seriousTargets.length === 1) {
    const sq = seriousTargets[0];
    const name = PIECE_NAME[after.get(sq)!.type];
    const phrase = `Attacks the ${name} on ${sq}.`;
    // Only a supporting detail if the headline already says something else.
    if (headline) facts.push(phrase);
    else headline = phrase;
  }

  // --- Did this move rescue a piece that was under fire? ---
  if (isLoose(before, from) && !move.captured) {
    facts.push(`Moves the ${movedName} off ${from}, where it was under attack.`);
    if (!headline) headline = `Saves the ${movedName}.`;
  }

  // --- What does it leave hanging? ---
  const looseBefore = new Set(looseSquares(before, moverColor).map(String));
  const looseAfter = looseSquares(after, moverColor).filter((sq) => !looseBefore.has(sq));
  if (looseAfter.length > 0) {
    const names = looseAfter.map((sq) => namePieceAt(after, sq));
    facts.push(`Careful: this leaves ${joinList(names)} undefended.`);
  }

  // --- Development and space, only worth saying for quiet moves ---
  if (!headline) {
    const fromRank = from[1];
    const isDeveloping =
      (movedPiece.type === 'n' || movedPiece.type === 'b') && fromRank === backRank(moverColor);

    if (isDeveloping) {
      headline = `Develops the ${movedName} to ${to}.`;
      facts.push('Brings a new piece into the game.');
    } else if (movedPiece.type === 'p' && CENTER.has(to)) {
      headline = `Claims the centre with the pawn on ${to}.`;
    } else if (movedPiece.type === 'r' && (to[0] === 'd' || to[0] === 'e')) {
      headline = `Puts the rook on the ${to[0]}-file.`;
    } else if (BIG_CENTER.has(to)) {
      headline = `Improves the ${movedName} to ${to}.`;
    } else {
      headline = `Plays ${movedName} to ${to}.`;
    }
  }

  // The headline is shown above the facts, so never repeat it in the list.
  return {
    uci,
    san: move.san,
    headline,
    facts: facts.filter((f) => f !== headline).map(capitalize),
  };
}

/** Convert a UCI principal variation into readable SAN, stopping at the first illegal move. */
export function pvToSan(fen: string, pv: string[] | null | undefined, maxPlies = 8): string[] {
  if (!pv || pv.length === 0) return [];
  const c = new Chess();
  try {
    c.load(fen);
  } catch {
    return [];
  }

  const out: string[] = [];
  for (const uci of pv.slice(0, maxPlies)) {
    try {
      const mv = c.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length >= 5 ? uci[4] : undefined,
      });
      if (!mv) break;
      out.push(mv.san);
    } catch {
      break;
    }
  }
  return out;
}

/** Render a SAN list as "1. e4 e5 2. Nf3" starting from the given ply. */
export function formatSanLine(sans: string[], startPly: number): string {
  const parts: string[] = [];
  for (let i = 0; i < sans.length; i++) {
    const ply = startPly + i;
    const moveNo = Math.floor(ply / 2) + 1;
    if (ply % 2 === 0) parts.push(`${moveNo}.`);
    else if (i === 0) parts.push(`${moveNo}...`);
    parts.push(sans[i]);
  }
  return parts.join(' ');
}
