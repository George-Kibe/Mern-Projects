import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

const STORAGE_KEY = 'chess-trainer:v1';

/**
 * Last line of defence against a blank page.
 *
 * A throw during render unmounts the whole tree, leaving an empty screen with no
 * clue what happened — which is exactly what stale persisted state once caused.
 * Showing the error, and offering to clear the saved data that most likely
 * caused it, turns a dead end into something recoverable.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Chess Trainer crashed:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="text-xl font-bold text-tag-blunder">Something broke</h1>

        <p className="mt-3 text-sm text-ink-soft">
          The app hit an error it could not recover from. Your saved settings or games
          are the usual cause — clearing them fixes it and loses nothing but your
          preferences and the local game list.
        </p>

        <pre className="mt-4 overflow-auto rounded border border-line bg-panel p-3 text-xs text-ink-soft">
          {error.message}
        </pre>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              try {
                localStorage.removeItem(STORAGE_KEY);
              } catch {
                /* storage may be unavailable; reloading is still worth a try */
              }
              location.reload();
            }}
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-black hover:bg-accent/85"
          >
            Clear saved data and reload
          </button>
          <button
            onClick={() => location.reload()}
            className="rounded border border-line px-3 py-1.5 text-sm text-ink-soft hover:border-accent hover:text-ink"
          >
            Just reload
          </button>
        </div>
      </div>
    );
  }
}
