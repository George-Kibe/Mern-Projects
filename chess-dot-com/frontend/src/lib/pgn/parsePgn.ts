import { Chess } from 'chess.js';

export type ParsedPgn = {
  headers: Record<string, string>;
  sanMoves: string[]; // one entry per ply
  fens: string[]; // length = sanMoves.length + 1
};

function getHeaderCaseInsensitive(headers: Record<string, string>, key: string): string | undefined {
  const found = Object.entries(headers).find(([k]) => k.toLowerCase() === key.toLowerCase());
  return found?.[1];
}

export function parsePgn(pgnText: string): ParsedPgn {
  const chess = new Chess();
  chess.loadPgn(pgnText, { strict: false });

  const headers = chess.getHeaders();
  const verboseMoves = chess.history({ verbose: true });

  // Rebuild positions from initial state so we can capture FEN after each ply.
  const startFen = getHeaderCaseInsensitive(headers, 'FEN');
  const replay = startFen ? new Chess(startFen) : new Chess();

  const fens: string[] = [replay.fen()];
  const sanMoves: string[] = [];

  for (const mv of verboseMoves) {
    sanMoves.push(mv.san);
    replay.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
    fens.push(replay.fen());
  }

  return { headers, sanMoves, fens };
}
