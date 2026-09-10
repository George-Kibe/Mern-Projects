const PIECE_WORD: Record<string, string> = {
  K: 'king',
  Q: 'queen',
  R: 'rook',
  B: 'bishop',
  N: 'knight',
};

const FILE_WORD: Record<string, string> = {
  a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h',
};

/**
 * Turn SAN into something a speech synthesiser reads intelligibly.
 *
 * Read literally, "Nxe4" comes out as "en ex ee four", which is useless as
 * coaching. This produces "knight takes e4".
 */
export function sanToSpeech(san: string): string {
  if (!san) return '';

  let s = san.trim();

  // Castling first — it shares no structure with normal moves.
  if (/^O-O-O/.test(s)) return withSuffix(s, 'castles queenside');
  if (/^O-O/.test(s)) return withSuffix(s, 'castles kingside');

  const parts: string[] = [];

  // Leading piece letter (absent for pawn moves).
  const pieceMatch = s.match(/^([KQRBN])/);
  if (pieceMatch) {
    parts.push(PIECE_WORD[pieceMatch[1]]);
    s = s.slice(1);
  }

  // Disambiguation: the file and/or rank the piece came from.
  const disambig = s.match(/^([a-h]?)([1-8]?)(x?)([a-h][1-8])/);
  if (disambig) {
    const [, file, rank, capture, target] = disambig;

    if (pieceMatch) {
      if (file) parts.push(FILE_WORD[file]);
      if (rank) parts.push(rank);
    } else if (file && capture) {
      // Pawn capture: "exd5" -> "e takes d5"
      parts.push(FILE_WORD[file]);
    }

    if (capture) parts.push('takes');
    parts.push(speakSquare(target));
    s = s.slice(disambig[0].length);
  }

  // Promotion.
  const promo = s.match(/^=([QRBN])/);
  if (promo) {
    parts.push('promotes to', PIECE_WORD[promo[1]]);
  }

  return withSuffix(san, parts.join(' '));
}

function withSuffix(originalSan: string, spoken: string): string {
  if (originalSan.includes('#')) return `${spoken} checkmate`;
  if (originalSan.includes('+')) return `${spoken} check`;
  return spoken;
}

/** "e4" -> "e 4" so the synthesiser doesn't run the file and rank together. */
function speakSquare(square: string): string {
  return `${square[0]} ${square[1]}`;
}

/** "17..." / "17." style prefix, spoken. */
export function plyToSpeech(ply: number): string {
  const moveNo = Math.floor(ply / 2) + 1;
  const side = ply % 2 === 0 ? 'White' : 'Black';
  return `${side}'s move ${moveNo}`;
}

/** Speak an evaluation the way a coach would, not as a raw number. */
export function evalToSpeech(cp: number | null): string {
  if (cp === null) return 'no evaluation';
  if (Math.abs(cp) >= 90000) return cp > 0 ? 'mate for White' : 'mate for Black';

  const pawns = Math.abs(cp) / 100;
  const side = cp > 0 ? 'White' : 'Black';

  if (pawns < 0.3) return 'the position is level';
  if (pawns < 0.8) return `${side} is slightly better`;
  if (pawns < 1.5) return `${side} is clearly better`;
  if (pawns < 3) return `${side} is winning a piece worth of advantage`;
  return `${side} is completely winning`;
}
