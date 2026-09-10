import { useCallback, useState } from 'react';
import { Analyze } from '../panels/Analyze';
import { PlayEngine } from '../panels/PlayEngine';
import { PlayFriend } from '../panels/PlayFriend';

type Mode = 'play' | 'friend' | 'analyze';

const TABS: Array<{ id: Mode; label: string; hint: string }> = [
  { id: 'play', label: 'Play the engine', hint: 'Pick a strength and play a training game' },
  { id: 'analyze', label: 'Analyze', hint: 'Load a PGN and go through it with the engine' },
  { id: 'friend', label: 'Play a friend', hint: 'Two browsers, one game, over the local server' },
];

export function Home() {
  const [mode, setMode] = useState<Mode>('play');

  // Bumping the token re-triggers the load even if the same PGN comes back.
  const [pgnToLoad, setPgnToLoad] = useState<{ pgn: string; label: string; token: number } | null>(null);

  const sendToAnalysis = useCallback((pgn: string, label: string) => {
    setPgnToLoad({ pgn, label, token: Date.now() });
    setMode('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="mx-auto flex min-h-full max-w-[1500px] flex-col gap-4 px-4 py-4">
      <header className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/chess.png" alt="" className="h-7 w-7" />
          <h1 className="text-lg font-bold tracking-tight">Chess Trainer</h1>
        </div>

        <nav className="flex gap-1 rounded-lg border border-line bg-panel p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              title={tab.hint}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === tab.id ? 'bg-accent text-black' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <p className="ml-auto hidden text-xs text-ink-soft lg:block">
          Stockfish runs in your browser · games are kept on this device
        </p>
      </header>

      <main>
        {/* Each panel keeps its own state, so the games stay put while you switch tabs. */}
        <div hidden={mode !== 'play'}>
          <PlayEngine onAnalyze={sendToAnalysis} />
        </div>
        <div hidden={mode !== 'analyze'}>
          <Analyze pgnToLoad={pgnToLoad} />
        </div>
        <div hidden={mode !== 'friend'}>
          <PlayFriend onAnalyze={sendToAnalysis} />
        </div>
      </main>
    </div>
  );
}
