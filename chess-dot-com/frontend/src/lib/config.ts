/**
 * Where the optional game server lives.
 *
 * The app is designed to work without it: playing the engine, analysis,
 * openings and puzzles all run entirely in the browser. The server only adds
 * "Play a friend" and the host-rendered voice.
 *
 * On a deployed site with no server configured we must not attempt a connection
 * at all — a hardcoded localhost URL would fail on every visitor's machine and
 * fill their console with errors.
 */
const configured = import.meta.env.VITE_APP_WS_URL as string | undefined;

function isLocalHost(): boolean {
  if (typeof window === 'undefined') return false;
  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

/** WebSocket URL for the game server, or null when there is no server to talk to. */
export const WS_URL: string | null =
  configured && configured.trim() !== ''
    ? configured.trim()
    : isLocalHost()
      ? 'ws://localhost:8000'
      : null;

/** HTTP origin of the same server, or null. */
export const SERVER_HTTP: string | null = WS_URL ? WS_URL.replace(/^ws/, 'http') : null;

/** True when a game server is configured at all. */
export const HAS_SERVER = WS_URL !== null;
