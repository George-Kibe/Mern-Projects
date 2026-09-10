import { execFile } from "node:child_process";
import { spawn } from "node:child_process";

const MAX_TEXT_LENGTH = 2000;

export type HostVoice = {
    name: string;
    language: string;
    variant: string;
};

export type HostSpeechOptions = {
    /** speech-dispatcher scales: -100 (quietest/slowest/lowest) to 100. */
    volume?: number;
    rate?: number;
    pitch?: number;
    /** Output module, e.g. "espeak-ng" or "rhvoice". */
    module?: string;
    /** Synthesis voice name as reported by `spd-say -L`. */
    voice?: string;
};

/**
 * Host-side speech, for browsers that expose no voices of their own.
 *
 * Chrome on Linux hides every system voice unless it is launched with
 * --enable-speech-dispatcher, which is easy to miss and impossible to fix from
 * a web page. This server runs on the same machine as the browser, so it can
 * speak through the system's own speech-dispatcher instead.
 *
 * `spawn`/`execFile` are used without a shell and the text is passed as a single
 * argument after `--`, so nothing in it can be read as a flag or a command.
 */
function runSpdSay(args: string[]): Promise<number> {
    return new Promise((resolve, reject) => {
        const child = spawn("spd-say", args, { stdio: "ignore" });
        child.on("error", reject);
        child.on("exit", (code) => resolve(code ?? 1));
    });
}

function captureSpdSay(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        execFile("spd-say", args, { timeout: 10_000 }, (err, stdout) => {
            if (err && !stdout) reject(err);
            else resolve(stdout);
        });
    });
}

export async function isSpeechAvailable(): Promise<boolean> {
    try {
        return (await runSpdSay(["--version"])) === 0;
    } catch {
        return false;
    }
}

export async function listModules(): Promise<string[]> {
    try {
        const out = await captureSpdSay(["-O"]);
        return out
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line && line.toUpperCase() !== "OUTPUT MODULES");
    } catch {
        return [];
    }
}

/**
 * Voices for a module, trimmed to something a picker can show.
 *
 * espeak-ng advertises every base voice crossed with every variant — thousands
 * of rows — so only English base voices are kept.
 */
export async function listVoices(mod?: string): Promise<HostVoice[]> {
    try {
        const out = await captureSpdSay(mod ? ["-o", mod, "-L"] : ["-L"]);
        const voices: HostVoice[] = [];

        for (const raw of out.split("\n")) {
            const line = raw.trim();
            if (!line || line.startsWith("NAME")) continue;

            // Voice names contain spaces, so read the two fixed columns off the end.
            const parts = line.split(/\s+/);
            if (parts.length < 3) continue;

            const variant = parts[parts.length - 1]!;
            const language = parts[parts.length - 2]!;
            const name = parts.slice(0, parts.length - 2).join(" ");

            if (!name || name.includes("+")) continue;
            // Strictly an English language tag: "en", "en-GB", "en-GB-X-RP".
            // A loose prefix check also matches names that spill into this column.
            if (!/^en(-[A-Za-z0-9-]+)?$/i.test(language)) continue;

            voices.push({ name, language, variant });
        }

        return voices.slice(0, 60);
    } catch {
        return [];
    }
}

const clamp = (n: number) => Math.max(-100, Math.min(100, Math.round(n)));

export async function speakOnHost(text: string, opts: HostSpeechOptions = {}): Promise<void> {
    const trimmed = text.trim().slice(0, MAX_TEXT_LENGTH);
    if (!trimmed) return;

    // Cancel whatever is queued so stepping through moves interrupts cleanly.
    await runSpdSay(["--cancel"]).catch(() => 0);

    const args: string[] = [
        // Default to full volume: the speech-dispatcher default is noticeably quiet.
        "-i", String(clamp(opts.volume ?? 100)),
        "-r", String(clamp(opts.rate ?? 0)),
        "-p", String(clamp(opts.pitch ?? 0)),
    ];

    if (opts.module) args.push("-o", opts.module);
    if (opts.voice) args.push("-y", opts.voice);

    args.push("--", trimmed);

    const code = await runSpdSay(args);
    if (code !== 0) throw new Error(`spd-say exited with ${code}`);
}

export async function stopHostSpeech(): Promise<void> {
    await runSpdSay(["--cancel"]).catch(() => 0);
}
