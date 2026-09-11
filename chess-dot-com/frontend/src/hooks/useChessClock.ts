import { useCallback, useEffect, useRef, useState } from 'react';
import type { Color } from 'chess.js';
import type { TimeControl } from '../lib/time/controls';

export type ClockTimes = { w: number; b: number };

export type UseChessClock = {
  times: ClockTimes;
  flagged: Color | null;
  /** Add the increment to the side that just moved. */
  press: (mover: Color) => void;
  reset: () => void;
  enabled: boolean;
};

/**
 * A two-sided chess clock.
 *
 * Ticks off elapsed wall-clock time rather than counting intervals, so a
 * throttled background tab or a slow frame cannot make the clock drift.
 */
export function useChessClock(options: {
  control: TimeControl;
  /** Whose clock is running; null pauses both. */
  activeColor: Color | null;
  onFlag?: (loser: Color) => void;
}): UseChessClock {
  const { control, activeColor, onFlag } = options;
  const enabled = control.initialMs > 0;

  const [times, setTimes] = useState<ClockTimes>({
    w: control.initialMs,
    b: control.initialMs,
  });
  const [flagged, setFlagged] = useState<Color | null>(null);

  // Mirrors of state for the interval, kept in effects so nothing reads a ref
  // during render.
  const timesRef = useRef(times);
  useEffect(() => {
    timesRef.current = times;
  }, [times]);

  const onFlagRef = useRef(onFlag);
  useEffect(() => {
    onFlagRef.current = onFlag;
  }, [onFlag]);

  const reset = useCallback(() => {
    const fresh = { w: control.initialMs, b: control.initialMs };
    timesRef.current = fresh;
    setTimes(fresh);
    setFlagged(null);
  }, [control.initialMs]);

  // Starting a new time control restarts the clocks. Adjusted during render
  // rather than in an effect, so the old times are never painted first.
  const [appliedControl, setAppliedControl] = useState(control.id);
  if (appliedControl !== control.id) {
    setAppliedControl(control.id);
    setTimes({ w: control.initialMs, b: control.initialMs });
    setFlagged(null);
  }

  useEffect(() => {
    if (!enabled || !activeColor || flagged) return;

    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const delta = now - last;
      last = now;

      const current = timesRef.current;
      const remaining = Math.max(0, current[activeColor] - delta);
      const next = { ...current, [activeColor]: remaining };

      timesRef.current = next;
      setTimes(next);

      if (remaining === 0) {
        setFlagged(activeColor);
        onFlagRef.current?.(activeColor);
      }
    }, 100);

    return () => clearInterval(id);
  }, [enabled, activeColor, flagged]);

  const press = useCallback(
    (mover: Color) => {
      if (!enabled || control.incrementMs === 0) return;
      const current = timesRef.current;
      // A side that has already flagged gains nothing from the increment.
      if (current[mover] <= 0) return;

      const next = { ...current, [mover]: current[mover] + control.incrementMs };
      timesRef.current = next;
      setTimes(next);
    },
    [enabled, control.incrementMs],
  );

  return { times, flagged, press, reset, enabled };
}

/** A single countdown, for puzzles. */
export function useCountdown(options: {
  totalMs: number;
  running: boolean;
  /** Change this to restart the countdown — a new puzzle, say. */
  resetKey?: string | number;
  onExpire?: () => void;
}): { remaining: number; reset: () => void; enabled: boolean } {
  const { totalMs, running, resetKey, onExpire } = options;
  const enabled = totalMs > 0;

  const [remaining, setRemaining] = useState(totalMs);
  const remainingRef = useRef(totalMs);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const reset = useCallback(() => {
    remainingRef.current = totalMs;
    setRemaining(totalMs);
  }, [totalMs]);

  // Same pattern: a new limit, or a new subject, resets the countdown during render.
  const [applied, setApplied] = useState({ totalMs, resetKey });
  if (applied.totalMs !== totalMs || applied.resetKey !== resetKey) {
    setApplied({ totalMs, resetKey });
    setRemaining(totalMs);
  }

  useEffect(() => {
    if (!enabled || !running) return;

    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const delta = now - last;
      last = now;

      const next = Math.max(0, remainingRef.current - delta);
      remainingRef.current = next;
      setRemaining(next);

      if (next === 0) onExpireRef.current?.();
    }, 100);

    return () => clearInterval(id);
  }, [enabled, running]);

  return { remaining, reset, enabled };
}
