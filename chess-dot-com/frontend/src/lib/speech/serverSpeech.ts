/**
 * Voice fallback that goes through the local game server instead of the browser.
 *
 * Browser speech synthesis is unreliable on Linux — Chrome exposes no voices at
 * all unless it was started with --enable-speech-dispatcher, which a web page
 * cannot detect the cause of or fix. The server runs on this same machine, so it
 * can speak through the system's own speech-dispatcher regardless of browser.
 */
const WS_URL = import.meta.env.VITE_APP_WS_URL ?? 'ws://localhost:8000';
const HTTP_BASE = WS_URL.replace(/^ws/, 'http');

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
  try {
    await fetch(`${HTTP_BASE}/speech/stop`, { method: 'POST' });
  } catch {
    /* nothing to stop if the server is gone */
  }
}
