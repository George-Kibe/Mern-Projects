import { execFile, spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Text-to-speech that renders a WAV the browser can play.
 *
 * This is deliberately not speech-dispatcher. Routing audio through the browser
 * means no Chrome launch flags, no system voice list to go missing, and the
 * tab's own volume control works — the three things that made the other routes
 * unreliable. The engine used is whichever of the known ones is installed,
 * best first.
 */
export type EngineId = "piper" | "pico2wave" | "espeak-ng";

export type TtsEngineInfo = {
    id: EngineId;
    name: string;
    quality: "neural" | "good" | "basic";
    note: string;
};

export type RenderOptions = {
    /** -100..100, mapped onto whatever the chosen engine supports. */
    rate?: number;
    pitch?: number;
};

const ENGINES: TtsEngineInfo[] = [
    {
        id: "piper",
        name: "Piper (neural)",
        quality: "neural",
        note: "Best quality. Needs the piper binary and a voice model in PIPER_VOICE.",
    },
    {
        id: "pico2wave",
        name: "SVOX Pico",
        quality: "good",
        note: "Clear and natural enough for coaching. sudo apt install libttspico-utils",
    },
    {
        id: "espeak-ng",
        name: "eSpeak NG",
        quality: "basic",
        note: "Robotic, but tiny and always available. sudo apt install espeak-ng",
    },
];

/** Piper takes its text on stdin, not as an argument. */
function runWithStdin(cmd: string, args: string[], input: string, timeout = 60_000): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { stdio: ["pipe", "ignore", "pipe"] });
        let stderr = "";
        const timer = setTimeout(() => {
            child.kill("SIGKILL");
            reject(new Error(`${cmd} timed out`));
        }, timeout);

        child.stderr?.on("data", (d) => (stderr += d));
        child.on("error", (err) => {
            clearTimeout(timer);
            reject(err);
        });
        child.on("close", (code) => {
            clearTimeout(timer);
            if (code === 0) resolve();
            else reject(new Error(`${cmd} exited ${code}: ${stderr.slice(-300)}`));
        });

        child.stdin?.end(input);
    });
}

function run(cmd: string, args: string[], timeout = 20_000): Promise<string> {
    return new Promise((resolve, reject) => {
        execFile(cmd, args, { timeout, maxBuffer: 1 << 24 }, (err, stdout) => {
            if (err) reject(err);
            else resolve(stdout);
        });
    });
}

async function has(cmd: string, args: string[] = ["--version"]): Promise<boolean> {
    try {
        await run(cmd, args, 5000);
        return true;
    } catch (err) {
        // A tool that exists but dislikes --version still counts as present.
        return (err as NodeJS.ErrnoException).code !== "ENOENT";
    }
}

/** Piper is usually unpacked into ~/.local rather than installed on PATH. */
function piperBin(): string {
    return process.env.PIPER_BIN || "piper";
}

let cached: TtsEngineInfo[] | null = null;

export async function availableEngines(): Promise<TtsEngineInfo[]> {
    if (cached) return cached;

    const found: TtsEngineInfo[] = [];
    for (const engine of ENGINES) {
        // Piper is useless without a voice model, so do not advertise it bare.
        if (engine.id === "piper") {
            if (!process.env.PIPER_VOICE) continue;
            if (await has(piperBin())) found.push(engine);
            continue;
        }
        if (await has(engine.id)) found.push(engine);
    }

    cached = found;
    return found;
}

/** Clear the detection cache so a newly installed engine is picked up. */
export function refreshEngines() {
    cached = null;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Render `text` to WAV bytes using `engineId`, or the best engine available. */
export async function renderSpeech(
    text: string,
    engineId?: EngineId,
    opts: RenderOptions = {},
): Promise<{ wav: Buffer; engine: EngineId }> {
    const engines = await availableEngines();
    if (engines.length === 0) throw new Error("No text-to-speech engine installed");

    const chosen = engines.find((e) => e.id === engineId) ?? engines[0]!;
    const clean = text.trim().slice(0, 2000);
    if (!clean) throw new Error("Nothing to speak");

    const dir = await mkdtemp(join(tmpdir(), "chess-tts-"));
    const out = join(dir, "speech.wav");

    try {
        // Arguments are passed as an array with no shell, so nothing in the text
        // can be read as a flag or a command.
        if (chosen.id === "piper") {
            const lengthScale = clamp(1 - (opts.rate ?? 0) / 200, 0.5, 2).toFixed(2);
            await runWithStdin(
                piperBin(),
                [
                    "--model", process.env.PIPER_VOICE!,
                    "--output_file", out,
                    "--length_scale", lengthScale,
                ],
                clean,
            );
        } else if (chosen.id === "pico2wave") {
            // Pico has no rate or pitch controls; playback rate is adjusted in the browser.
            await run("pico2wave", ["-l", "en-GB", "-w", out, clean]);
        } else {
            // espeak-ng: -s words per minute, -p pitch 0-99.
            const wpm = Math.round(clamp(165 + (opts.rate ?? 0) * 0.6, 80, 300));
            const pitch = Math.round(clamp(50 + (opts.pitch ?? 0) * 0.4, 0, 99));
            await run("espeak-ng", ["-w", out, "-s", String(wpm), "-p", String(pitch), "--", clean]);
        }

        return { wav: await readFile(out), engine: chosen.id };
    } finally {
        await rm(dir, { recursive: true, force: true }).catch(() => {});
    }
}
