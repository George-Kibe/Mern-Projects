import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager.js";
import { isSpeechAvailable, listModules, listVoices, speakOnHost, stopHostSpeech } from "./speech.js";

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

    // Voices the host can speak with, so the web app can offer a real choice.
    if (url.startsWith("/speech/voices")) {
        const mod = new URL(url, "http://localhost").searchParams.get("module") ?? undefined;
        const [modules, voices] = await Promise.all([listModules(), listVoices(mod)]);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ modules, voices }));
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
    console.log(
        (await isSpeechAvailable())
            ? "Host speech available (spd-say) — the web app can fall back to it."
            : "Host speech unavailable: spd-say not found. Install speech-dispatcher for the voice fallback.",
    );
});
