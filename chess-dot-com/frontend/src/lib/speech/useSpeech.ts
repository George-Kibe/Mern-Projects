import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechSettings = {
  enabled: boolean;
  rate: number;
  voiceUri: string | null;
};

export type SpeechProblem =
  | { kind: 'unsupported' }
  /** The API exists but the system exposes no voices at all. */
  | { kind: 'no-voices' }
  /** speak() was accepted but nothing ever started playing. */
  | { kind: 'silent' }
  | { kind: 'error'; detail: string };

/**
 * Wrapper over the Web Speech API that reports why it is silent.
 *
 * Speech fails quietly in several ways — a browser with no installed voices
 * (common on Linux, where Chrome and Firefox both go through speech-dispatcher),
 * or an utterance rejected because the page has not seen a user gesture. In all
 * of those cases `speak()` returns normally and simply produces no sound, so the
 * failure has to be detected and surfaced rather than assumed away.
 */
export function useSpeech(settings: SpeechSettings) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [runtimeProblem, setRuntimeProblem] = useState<SpeechProblem | null>(null);
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  );

  // Distinguishes "no voices yet" from "no voices at all".
  const [voicesSettled, setVoicesSettled] = useState(false);

  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!supported) return;

    const load = () => {
      const list = window.speechSynthesis.getVoices();
      if (list.length) {
        setVoices(list);
        setVoicesSettled(true);
      }
    };

    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);

    // getVoices() is populated asynchronously and fires no event when the list
    // is genuinely empty, so give it a moment before calling it settled.
    const settle = setTimeout(() => setVoicesSettled(true), 2000);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      clearTimeout(settle);
    };
  }, [supported]);

  const clearTimers = useCallback(() => {
    if (startTimerRef.current) clearTimeout(startTimerRef.current);
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    startTimerRef.current = null;
    keepAliveRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    if (!supported) return;
    clearTimers();
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported, clearTimers]);

  const { enabled, rate, voiceUri } = settings;

  const speak = useCallback(
    (text: string) => {
      if (!supported) {
        setRuntimeProblem({ kind: 'unsupported' });
        return;
      }
      if (!enabled || !text.trim()) return;

      const available = window.speechSynthesis.getVoices();
      if (available.length === 0 && voicesSettled) {
        setRuntimeProblem({ kind: 'no-voices' });
        return;
      }

      clearTimers();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;

      if (voiceUri) {
        const match = available.find((v) => v.voiceURI === voiceUri);
        if (match) utterance.voice = match;
      }

      utterance.onstart = () => {
        if (startTimerRef.current) clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
        setSpeaking(true);
        setRuntimeProblem(null);
      };
      utterance.onend = () => {
        clearTimers();
        setSpeaking(false);
      };
      utterance.onerror = (e) => {
        clearTimers();
        setSpeaking(false);
        // Cancelling on purpose fires an error too; that is not a fault.
        if (e.error === 'canceled' || e.error === 'interrupted') return;
        setRuntimeProblem(
          e.error === 'not-allowed'
            ? { kind: 'silent' }
            : { kind: 'error', detail: String(e.error) },
        );
      };

      window.speechSynthesis.speak(utterance);

      // If nothing has started shortly after queueing, it never will.
      startTimerRef.current = setTimeout(() => {
        if (!window.speechSynthesis.speaking) setRuntimeProblem({ kind: 'silent' });
      }, 1500);

      // Chrome stops long utterances after ~15s unless nudged.
      keepAliveRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10_000);
    },
    [supported, enabled, rate, voiceUri, voicesSettled, clearTimers],
  );

  // Never leave speech running after the component goes away.
  useEffect(() => cancel, [cancel]);

  const selectableVoices = pickVoices(voices);

  // Lack of support is a static fact about the browser, so derive it rather
  // than pushing it through state from an effect.
  const problem: SpeechProblem | null = supported
    ? runtimeProblem
    : { kind: 'unsupported' };

  return {
    speak,
    cancel,
    speaking,
    supported,
    problem,
    /** True once we know whether any voices exist. */
    voicesSettled,
    hasVoices: voices.length > 0,
    voices: selectableVoices,
  };
}

/**
 * Reduce the raw voice list to something a dropdown can show.
 *
 * espeak-ng advertises every base voice crossed with every variant — nearly a
 * thousand English entries like "English (America)+Alicia" — which is useless in
 * a picker. The base voices carry all the real choice.
 */
function pickVoices(all: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const english = all.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const pool = english.length ? english : all;

  const base = pool.filter((v) => !v.name.includes('+'));
  const chosen = base.length ? base : pool;

  return [...chosen]
    .sort((a, b) => Number(b.default) - Number(a.default) || a.name.localeCompare(b.name))
    .slice(0, 60);
}

/** Actionable, platform-aware explanation for a speech failure. */
export function describeSpeechProblem(problem: SpeechProblem): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const onLinux = /linux/i.test(ua) && !/android/i.test(ua);
  // Edge and Opera also match "Chrome"; they share the same limitation.
  const chromium = /chrome|chromium|edg\//i.test(ua);

  switch (problem.kind) {
    case 'unsupported':
      return 'This browser has no speech synthesis. Chrome, Edge or Safari will work.';

    case 'no-voices':
      if (onLinux && chromium) {
        // Chrome on Linux hides every system voice unless this switch is passed;
        // the voices themselves are usually already installed.
        return 'Chrome on Linux only exposes system voices when it is started with --enable-speech-dispatcher. Quit Chrome completely, then run: google-chrome --enable-speech-dispatcher. Firefox needs no flag. If you have no voices at all, install them first: sudo apt install speech-dispatcher speech-dispatcher-espeak-ng';
      }
      if (onLinux) {
        return 'No speech voices are available. Install them with: sudo apt install speech-dispatcher speech-dispatcher-espeak-ng, then restart the browser. Check the system itself with: spd-say "test"';
      }
      return 'No speech voices are installed for this browser. Add a system voice, then reload.';

    case 'silent':
      return 'The browser accepted the text but played nothing — usually a muted tab, or a voice that needs a click first. Press Speak once to allow it.';

    case 'error':
      return `Speech failed: ${problem.detail}.`;
  }
}
