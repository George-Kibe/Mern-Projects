/**
 * Time controls, shared by every mode that has a clock.
 *
 * Stored as milliseconds so the clock never has to think about units, and
 * expressed with the usual "minutes + increment" shorthand people recognise.
 */
export type TimeControl = {
  id: string;
  label: string;
  category: 'Untimed' | 'Bullet' | 'Blitz' | 'Rapid' | 'Classical';
  /** Starting time per side, in milliseconds. 0 means no clock. */
  initialMs: number;
  /** Added after each move, in milliseconds. */
  incrementMs: number;
};

const m = (minutes: number) => minutes * 60_000;

export const TIME_CONTROLS: TimeControl[] = [
  { id: 'unlimited', label: 'No clock', category: 'Untimed', initialMs: 0, incrementMs: 0 },

  { id: '1+0', label: '1 min', category: 'Bullet', initialMs: m(1), incrementMs: 0 },
  { id: '2+1', label: '2 | 1', category: 'Bullet', initialMs: m(2), incrementMs: 1000 },

  { id: '3+0', label: '3 min', category: 'Blitz', initialMs: m(3), incrementMs: 0 },
  { id: '3+2', label: '3 | 2', category: 'Blitz', initialMs: m(3), incrementMs: 2000 },
  { id: '5+0', label: '5 min', category: 'Blitz', initialMs: m(5), incrementMs: 0 },
  { id: '5+3', label: '5 | 3', category: 'Blitz', initialMs: m(5), incrementMs: 3000 },

  { id: '10+0', label: '10 min', category: 'Rapid', initialMs: m(10), incrementMs: 0 },
  { id: '10+5', label: '10 | 5', category: 'Rapid', initialMs: m(10), incrementMs: 5000 },
  { id: '15+10', label: '15 | 10', category: 'Rapid', initialMs: m(15), incrementMs: 10_000 },

  { id: '30+0', label: '30 min', category: 'Classical', initialMs: m(30), incrementMs: 0 },
  { id: '30+20', label: '30 | 20', category: 'Classical', initialMs: m(30), incrementMs: 20_000 },
];

export const DEFAULT_TIME_CONTROL = '10+0';

export function getTimeControl(id: string): TimeControl {
  return TIME_CONTROLS.find((t) => t.id === id) ?? TIME_CONTROLS[0];
}

/** Puzzle clocks are a single countdown, not a two-sided game clock. */
export type PuzzleTimeLimit = { id: string; label: string; ms: number };

export const PUZZLE_LIMITS: PuzzleTimeLimit[] = [
  { id: 'none', label: 'No limit', ms: 0 },
  { id: '15', label: '15 seconds', ms: 15_000 },
  { id: '30', label: '30 seconds', ms: 30_000 },
  { id: '60', label: '1 minute', ms: 60_000 },
  { id: '180', label: '3 minutes', ms: 180_000 },
];

export function getPuzzleLimit(id: string): PuzzleTimeLimit {
  return PUZZLE_LIMITS.find((l) => l.id === id) ?? PUZZLE_LIMITS[0];
}

/** "9:05", or "12.4" when under ten seconds, the way chess clocks are read. */
export function formatClock(ms: number): string {
  const safe = Math.max(0, ms);
  if (safe < 10_000) return (safe / 1000).toFixed(1);

  const total = Math.ceil(safe / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
