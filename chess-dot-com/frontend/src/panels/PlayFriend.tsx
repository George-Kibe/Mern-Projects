import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess, type Color, type Square } from 'chess.js';
import { Board } from '../components/Board';
import { Button, Panel } from '../components/ui';
import { downloadTextFile, pgnFilename } from '../lib/pgn/exportPgn';
import { useSocket } from '../hooks/useSocket';
import { useAppDispatch } from '../store';
import { saveGame } from '../store/gamesSlice';

const INIT_GAME = 'init_game';
const MOVE = 'move';
const GAME_OVER = 'game_over';

type Phase = 'idle' | 'waiting' | 'playing' | 'over';

const START_FEN = new Chess().fen();

export function PlayFriend({ onAnalyze }: { onAnalyze: (pgn: string, label: string) => void }) {
  const dispatch = useAppDispatch();
  const socket = useSocket();

  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(START_FEN);
  const [sans, setSans] = useState<string[]>([]);
  const [turn, setTurn] = useState<Color>('w');
  const [color, setColor] = useState<Color>('w');
  const [phase, setPhase] = useState<Phase>('idle');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const sync = useCallback(() => {
    const chess = chessRef.current;
    setFen(chess.fen());
    setSans(chess.history());
    setTurn(chess.turn());
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (event: MessageEvent) => {
      let message: { type: string; payload?: Record<string, unknown> };
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }

      switch (message.type) {
        case INIT_GAME: {
          chessRef.current = new Chess();
          // The server sends the word, not the chess.js letter.
          setColor(String(message.payload?.color) === 'black' ? 'b' : 'w');
          setPhase('playing');
          setLastMove(null);
          setNotice(null);
          sync();
          break;
        }
        case MOVE: {
          const payload = message.payload as { from?: string; to?: string; promotion?: string } | undefined;
          if (!payload?.from || !payload?.to) return;
          try {
            // Apply as a move, not a FEN load, so the game keeps its history and
            // can be handed to the analysis board afterwards.
            const mv = chessRef.current.move({
              from: payload.from,
              to: payload.to,
              promotion: payload.promotion,
            });
            if (mv) setLastMove({ from: mv.from as Square, to: mv.to as Square });
          } catch {
            return;
          }
          sync();
          break;
        }
        case GAME_OVER: {
          setPhase('over');
          setNotice(`Game over — ${String(message.payload?.winner ?? 'unknown')}`);
          break;
        }
        case 'ERROR': {
          setNotice(String(message.payload ?? 'The server rejected that move.'));
          break;
        }
      }
    };

    socket.addEventListener('message', onMessage);
    return () => socket.removeEventListener('message', onMessage);
  }, [socket, sync]);

  function findGame() {
    if (!socket) return;
    setPhase('waiting');
    setNotice(null);
    socket.send(JSON.stringify({ type: INIT_GAME }));
  }

  function onMove(move: { from: Square; to: Square; promotion?: string }) {
    if (!socket || phase !== 'playing') return false;

    // Validate locally first so an illegal drag never reaches the server.
    const probe = new Chess(chessRef.current.fen());
    try {
      if (!probe.move(move)) return false;
    } catch {
      return false;
    }

    socket.send(JSON.stringify({ type: MOVE, payload: move }));
    return true;
  }

  function buildPgn(): string {
    const chess = chessRef.current;
    chess.setHeader('Event', 'Friendly game');
    chess.setHeader('Date', new Date().toISOString().slice(0, 10).replace(/-/g, '.'));
    chess.setHeader('White', color === 'w' ? 'You' : 'Opponent');
    chess.setHeader('Black', color === 'b' ? 'You' : 'Opponent');
    return chess.pgn();
  }

  const yourTurn = phase === 'playing' && turn === color;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-3">
        <Board
          fen={fen}
          orientation={color}
          interactive={yourTurn}
          onMove={onMove}
          lastMove={lastMove}
        />
        <div className="min-h-[1.5rem] text-sm text-ink-soft">
          {phase === 'playing' ? (yourTurn ? 'Your move.' : "Opponent's move.") : null}
          {notice ? <span className="text-tag-inaccuracy">{notice}</span> : null}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Panel title="Play a friend" bodyClassName="p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${socket ? 'bg-accent' : 'bg-tag-blunder'}`}
              aria-hidden
            />
            <span className="text-ink-soft">
              {socket ? 'Connected to the game server' : 'No connection'}
            </span>
          </div>

          {!socket ? (
            <p className="text-xs text-ink-soft">
              Start the server with <code className="text-ink">npm run dev</code> in{' '}
              <code className="text-ink">backend/</code>, then reload this page.
            </p>
          ) : null}

          {phase === 'idle' || phase === 'over' ? (
            <Button variant="primary" onClick={findGame} disabled={!socket}>
              Find an opponent
            </Button>
          ) : null}

          {phase === 'waiting' ? (
            <p className="text-sm text-ink-soft">
              Waiting for another player — open this page in a second tab to pair with yourself.
            </p>
          ) : null}

          {phase === 'playing' || phase === 'over' ? (
            <p className="text-sm">
              You are playing <span className="font-semibold">{color === 'w' ? 'White' : 'Black'}</span>.
            </p>
          ) : null}
        </Panel>

        {sans.length > 0 ? (
          <>
            <Panel title="Moves" bodyClassName="max-h-[280px] overflow-auto p-3">
              <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-0.5 font-mono text-sm">
                {Array.from({ length: Math.ceil(sans.length / 2) }, (_, i) => (
                  <div key={i} className="contents">
                    <span className="text-ink-soft">{i + 1}.</span>
                    <span>{sans[i * 2]}</span>
                    <span>{sans[i * 2 + 1] ?? ''}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel bodyClassName="p-3 flex flex-col gap-2">
              <Button variant="primary" onClick={() => onAnalyze(buildPgn(), 'Friendly game')}>
                Analyze this game
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  dispatch(
                    saveGame({
                      pgn: buildPgn(),
                      label: 'Friendly game',
                      source: 'friend',
                      result: phase === 'over' ? (notice ?? 'finished') : 'unfinished',
                    }),
                  )
                }
              >
                Save to your games
              </Button>
              <Button
                variant="ghost"
                onClick={() => downloadTextFile(pgnFilename('friendly-game'), buildPgn())}
                title="Save this game as a .pgn file you can re-analyze later"
              >
                ⭳ Download PGN
              </Button>
            </Panel>
          </>
        ) : null}
      </div>
    </div>
  );
}
