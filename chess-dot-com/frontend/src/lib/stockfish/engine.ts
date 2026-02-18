export type StockfishScore =
  | { type: 'cp'; value: number }
  | { type: 'mate'; value: number };

export type StockfishAnalysis = {
  bestMove: string | null;
  score: StockfishScore | null; // normalized to White POV
  depth: number | null;
  pv: string[] | null;
};

export type AnalyzeOptions = {
  fen: string;
  depth?: number;
  movetimeMs?: number;
  multiPv?: number;
  signal?: AbortSignal;
};

function normalizeScoreToWhitePov(fen: string, score: StockfishScore): StockfishScore {
  // UCI score is from side-to-move perspective.
  const stm = fen.split(' ')[1];
  const mult = stm === 'b' ? -1 : 1;
  return { ...score, value: score.value * mult };
}

function forEachEngineLine(data: unknown, cb: (line: string) => void) {
  const text = String(data ?? '');
  // Stockfish.js sometimes batches multiple lines into one message.
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    cb(line);
  }
}

function parseInfoLine(line: string): {
  depth?: number;
  score?: StockfishScore;
  pv?: string[];
} {
  const out: { depth?: number; score?: StockfishScore; pv?: string[] } = {};

  const depthMatch = line.match(/\bdepth\s+(\d+)\b/);
  if (depthMatch) out.depth = Number(depthMatch[1]);

  const scoreMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)\b/);
  if (scoreMatch) {
    const type = scoreMatch[1] as 'cp' | 'mate';
    const value = Number(scoreMatch[2]);
    out.score = { type, value };
  }

  const pvIdx = line.indexOf(' pv ');
  if (pvIdx !== -1) {
    const pvStr = line.slice(pvIdx + 4).trim();
    if (pvStr.length > 0) {
      out.pv = pvStr.split(/\s+/);
    }
  }

  return out;
}

export class StockfishEngine {
  private worker: Worker;
  private readyPromise: Promise<void>;
  private disposed = false;
  private analysisGeneration = 0;

  constructor() {
    // stockfish.js is served from public/stockfish
    this.worker = new Worker('/stockfish/stockfish.js', { type: 'classic' });

    this.readyPromise = new Promise((resolve, reject) => {
      let sawUciOk = false;

      const onMessage = (ev: MessageEvent) => {
        forEachEngineLine(ev.data, (line) => {
          if (line === 'uciok') {
            sawUciOk = true;
            this.worker.postMessage('isready');
            return;
          }
          if (sawUciOk && line === 'readyok') {
            this.worker.removeEventListener('message', onMessage);
            resolve();
          }
        });
      };

      this.worker.addEventListener('message', onMessage);
      this.worker.addEventListener('error', (e) => {
        reject(e);
      });

      this.worker.postMessage('uci');
    });
  }

  async ready() {
    await this.readyPromise;
  }

  stop() {
    if (this.disposed) return;
    this.analysisGeneration++;
    this.worker.postMessage('stop');
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.worker.terminate();
  }

  async analyzePosition({ fen, depth = 12, movetimeMs, multiPv = 1, signal }: AnalyzeOptions): Promise<StockfishAnalysis> {
    await this.ready();

    if (this.disposed) {
      throw new Error('StockfishEngine is disposed');
    }

    const myGen = ++this.analysisGeneration;

    if (signal?.aborted) {
      throw signal.reason ?? new DOMException('Aborted', 'AbortError');
    }

    return await new Promise<StockfishAnalysis>((resolve, reject) => {
      let bestMove: string | null = null;
      let bestScore: StockfishScore | null = null;
      let bestDepth: number | null = null;
      let bestPv: string[] | null = null;

      const onAbort = () => {
        cleanup();
        this.worker.postMessage('stop');
        reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
      };

      const onMessage = (ev: MessageEvent) => {
        if (this.disposed) return;
        if (myGen !== this.analysisGeneration) return; // stale

        forEachEngineLine(ev.data, (line) => {
          if (line.startsWith('info ')) {
            const info = parseInfoLine(line);
            if (info.depth !== undefined) bestDepth = info.depth;
            if (info.score) {
              bestScore = normalizeScoreToWhitePov(fen, info.score);
            }
            if (info.pv) bestPv = info.pv;
            return;
          }

          if (line.startsWith('bestmove')) {
            const parts = line.split(/\s+/);
            bestMove = parts[1] && parts[1] !== '(none)' ? parts[1] : null;
            cleanup();
            resolve({ bestMove, score: bestScore, depth: bestDepth, pv: bestPv });
          }
        });
      };

      const cleanup = () => {
        this.worker.removeEventListener('message', onMessage);
        signal?.removeEventListener('abort', onAbort);
      };

      this.worker.addEventListener('message', onMessage);
      signal?.addEventListener('abort', onAbort, { once: true });

      // Start analysis
      this.worker.postMessage('ucinewgame');
      this.worker.postMessage(`setoption name MultiPV value ${multiPv}`);
      this.worker.postMessage(`position fen ${fen}`);

      if (movetimeMs && movetimeMs > 0) {
        this.worker.postMessage(`go movetime ${Math.floor(movetimeMs)}`);
      } else {
        this.worker.postMessage(`go depth ${Math.floor(depth)}`);
      }
    });
  }
}
