import { existsSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager.js";
import { isSpeechAvailable, listModules, listVoices, speakOnHost, stopHostSpeech } from "./speech.js";
import { availableEngines, refreshEngines, renderSpeech, type EngineId } from "./tts.js";

// Local config (Piper paths, port) without exporting anything by hand.
if (existsSync(".env")) {
    try {
        process.loadEnvFile(".env");
    } catch (err) {
        console.error("Could not read .env:", err);
    }
}

const PORT = Number(process.env.PORT ?? 8000);

const gameManager = new GameManager();

function applyCors(res: ServerResponse) {
    // Local-only tool: the browser and this server are the same machine.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
            if (body.length > 100_000) reject(new Error("Body too large"));
        });
        req.on("end", () => resolve(body));
        req.on("error", reject);
    });
}

const server = createServer(async (req, res) => {
    applyCors(res);

    if (req.method === "OPTIONS") {
        res.writeHead(204).end();
        return;
    }

    const url = req.url ?? "/";

    // Lets the web app find out whether host speech is usable before offering it.
    if (url === "/speech/status") {
        const available = await isSpeechAvailable();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ available }));
        return;
    }

    // Liveness probe for the platform's health checks.
    if (url === "/health" || url === "/") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, service: "chess-trainer-server" }));
        return;
    }

    // Voices the host can speak with, so the web app can offer a real choice.
    if (url.startsWith("/speech/voices")) {
        const mod = new URL(url, "http://localhost").searchParams.get("module") ?? undefined;
        const [modules, voices] = await Promise.all([listModules(), listVoices(mod)]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ modules, voices }));
        return;
    }

    // Engines that can render audio for the browser to play.
    if (url === "/speech/engines") {
        refreshEngines();
        const engines = await availableEngines();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ engines }));
        return;
    }

    // Render speech to WAV and hand it back — the browser plays it, so this
    // works with no launch flags and respects the tab's own volume.
    if (url === "/speech/audio" && req.method === "POST") {
        try {
            const body = JSON.parse(await readBody(req)) as {
                text?: string;
                engine?: EngineId;
                rate?: number;
                pitch?: number;
            };
            if (typeof body.text !== "string") {
                res.writeHead(400).end();
                return;
            }

            const { wav, engine } = await renderSpeech(body.text, body.engine, body);
            res.writeHead(200, {
                "Content-Type": "audio/wav",
                "Content-Length": String(wav.length),
                "X-Speech-Engine": engine,
                "Cache-Control": "no-store",
            });
            res.end(wav);
        } catch (err) {
            console.error("[speech] render failed", err);
            res.writeHead(503, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: String(err) }));
        }
        return;
    }

    if (url === "/speech/say" && req.method === "POST") {
        try {
            const body = JSON.parse(await readBody(req)) as {
                text?: string;
                volume?: number;
                rate?: number;
                pitch?: number;
                module?: string;
                voice?: string;
            };
            if (typeof body.text !== "string") {
                res.writeHead(400).end();
                return;
            }
            // Answer immediately; speaking a long line should not hold the request open.
            res.writeHead(202).end();
            void speakOnHost(body.text, body).catch((err) => console.error("[speech]", err));
        } catch (err) {
            console.error("[speech] bad request", err);
            res.writeHead(400).end();
        }
        return;
    }

    if (url === "/speech/stop" && req.method === "POST") {
        await stopHostSpeech();
        res.writeHead(204).end();
        return;
    }

    res.writeHead(404).end();
});

const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    gameManager.addUser(ws);

    // 'ws' emits 'close', never 'disconnect' — listening for the wrong event
    // left dead sockets sitting in the matchmaking queue.
    ws.on("close", () => {
        gameManager.removeUser(ws);
    });
});

server.listen(PORT, async () => {
    console.log(`Game server listening on ws://localhost:${PORT}`);
    const engines = await availableEngines();
    if (engines.length > 0) {
        console.log(`Voice: rendering audio with ${engines[0]!.name} (browser plays it).`);
    } else if (await isSpeechAvailable()) {
        console.log("Voice: falling back to spd-say. For a much better voice, install one of:");
        console.log("  sudo apt install libttspico-utils     # clear and natural");
        console.log("  sudo apt install espeak-ng            # robotic but tiny");
    } else {
        console.log("Voice unavailable: install libttspico-utils or espeak-ng.");
    }
});
