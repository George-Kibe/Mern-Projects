/**
 * Opponent strength presets.
 *
 * `elo` is used when the engine build exposes UCI_Elo (much more human-like weak
 * play); otherwise `skillLevel` is the fallback. Ratings are the engine's own
 * self-limiting scale and are approximate — treat them as relative rungs, not as
 * a calibrated FIDE equivalent.
 */
export type EngineLevel = {
  id: number;
  name: string;
  elo: number;
  skillLevel: number;
  movetimeMs: number;
  blurb: string;
};

export const ENGINE_LEVELS: EngineLevel[] = [
  { id: 0, name: 'Beginner', elo: 1320, skillLevel: 0, movetimeMs: 120, blurb: 'Hangs pieces and misses simple tactics.' },
  { id: 1, name: 'Casual', elo: 1500, skillLevel: 3, movetimeMs: 150, blurb: 'Knows the pieces, not the plans.' },
  { id: 2, name: 'Club', elo: 1700, skillLevel: 6, movetimeMs: 200, blurb: 'Punishes obvious blunders.' },
  { id: 3, name: 'Strong club', elo: 1900, skillLevel: 9, movetimeMs: 250, blurb: 'Solid tactics, real positional ideas.' },
  { id: 4, name: 'Expert', elo: 2100, skillLevel: 12, movetimeMs: 300, blurb: 'You will need a plan of your own.' },
  { id: 5, name: 'Master', elo: 2300, skillLevel: 15, movetimeMs: 400, blurb: 'Converts small edges without mercy.' },
  { id: 6, name: 'Grandmaster', elo: 2600, skillLevel: 18, movetimeMs: 600, blurb: 'Very few second chances.' },
  { id: 7, name: 'Full strength', elo: 3190, skillLevel: 20, movetimeMs: 800, blurb: 'No handicap at all. Good luck.' },
];

export const DEFAULT_LEVEL_ID = 2;

export function getLevel(id: number): EngineLevel {
  return ENGINE_LEVELS.find((l) => l.id === id) ?? ENGINE_LEVELS[DEFAULT_LEVEL_ID];
}
