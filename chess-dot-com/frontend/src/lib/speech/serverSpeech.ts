/**
 * Voice fallback that goes through the local game server instead of the browser.
 *
 * Browser speech synthesis is unreliable on Linux — Chrome exposes no voices at
 * all unless it was started with --enable-speech-dispatcher, which a web page
 * cannot detect the cause of or fix. The server runs on this same machine, so it
 * can speak through the system's own speech-dispatcher regardless of browser.
 */
import { SERVER_HTTP } from '../config';

const HTTP_BASE = SERVER_HTTP;

export type HostVoice = { name: string; language: string; variant: string };

export type HostVoiceSettings = {
  /** speech-dispatcher scales, -100 to 100. */
  volume: number;
  rate: number;
  pitch: number;
  module: string | null;
  voice: string | null;
};

export const DEFAULT_HOST_VOICE: HostVoiceSettings = {
  volume: 100,
  rate: -5,
  pitch: 0,
  module: null,
  voice: null,
};

export async function checkServerSpeech(signal?: AbortSignal): Promise<boolean> {
  if (!HTTP_BASE) return false;
  try {
    const res = await fetch(`${HTTP_BASE}/speech/status`, { signal });
    if (!res.ok) return false;
    const data = (await res.json()) as { available?: boolean };
    return data.available === true;
  } catch {
    // Server not running, or too old to have the endpoint.
    return false;
  }
}

export async function fetchHostVoices(
  module?: string | null,
  signal?: AbortSignal,
): Promise<{ modules: string[]; voices: HostVoice[] }> {
  if (!HTTP_BASE) return { modules: [], voices: [] };
  try {
    const query = module ? `?module=${encodeURIComponent(module)}` : '';
    const res = await fetch(`${HTTP_BASE}/speech/voices${query}`, { signal });
    if (!res.ok) return { modules: [], voices: [] };
    return (await res.json()) as { modules: string[]; voices: HostVoice[] };
  } catch {
    return { modules: [], voices: [] };
  }
}

export async function serverSpeak(text: string, settings: HostVoiceSettings): Promise<boolean> {
  if (!HTTP_BASE) return false;
  try {
    const res = await fetch(`${HTTP_BASE}/speech/say`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, ...settings }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function serverStopSpeech(): Promise<void> {
  if (!HTTP_BASE) return;
  try {
    await fetch(`${HTTP_BASE}/speech/stop`, { method: 'POST' });
  } catch {
    /* nothing to stop if the server is gone */
  }
}


/* ---------- Rendered audio: the reliable path ---------- */

export type TtsEngineInfo = {
  id: 'piper' | 'pico2wave' | 'espeak-ng';
  name: string;
  quality: 'neural' | 'good' | 'basic';
  note: string;
};

/** Which WAV-rendering engines the server can use, best first. */
export async function fetchTtsEngines(signal?: AbortSignal): Promise<TtsEngineInfo[]> {
  if (!HTTP_BASE) return [];
  try {
    const res = await fetch(`${HTTP_BASE}/speech/engines`, { signal });
    if (!res.ok) return [];
    const data = (await res.json()) as { engines?: TtsEngineInfo[] };
    return data.engines ?? [];
  } catch {
    return [];
  }
}

// One element, reused, so a new line always replaces the previous one.
let audioEl: HTMLAudioElement | null = null;
let audioUrl: string | null = null;

function releaseAudio() {
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
    audioUrl = null;
  }
}

export function stopRenderedSpeech() {
  if (audioEl) {
    audioEl.pause();
    audioEl.currentTime = 0;
  }
  releaseAudio();
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * Have the server render the line and play it here.
 *
 * Playing in the page is the whole point: it needs no browser launch flags, no
 * system voice list, and the tab's own volume control applies.
 */
export async function speakRendered(
  text: string,
  settings: HostVoiceSettings,
  engine?: string,
): Promise<boolean> {
  if (!HTTP_BASE) return false;
  try {
    const res = await fetch(`${HTTP_BASE}/speech/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, engine, rate: settings.rate, pitch: settings.pitch }),
    });
    if (!res.ok) return false;

    stopRenderedSpeech();

    const blob = await res.blob();
    audioUrl = URL.createObjectURL(blob);

    if (!audioEl) {
      audioEl = new Audio();
      audioEl.addEventListener('ended', releaseAudio);
    }

    audioEl.src = audioUrl;
    audioEl.volume = clamp(settings.volume, 0, 100) / 100;
    // Engines without a rate control (Pico) get it here instead.
    audioEl.playbackRate = clamp(1 + settings.rate / 200, 0.5, 2);

    await audioEl.play();
    return true;
  } catch {
    // Autoplay blocked, server down, or no engine — the caller falls back.
    return false;
  }
}
