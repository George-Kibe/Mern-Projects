export type StockfishScore =
  | { type: 'cp'; value: number }
  | { type: 'mate'; value: number };

/** One principal variation returned by the engine (MultiPV index 1 = best). */
export type EngineLine = {
  multipv: number;
  score: StockfishScore; // normalized to White POV
  depth: number;
  pv: string[]; // UCI moves
};

export type StockfishAnalysis = {
  bestMove: string | null;
  score: StockfishScore | null; // normalized to White POV
  depth: number | null;
  pv: string[] | null;
  /** Top-N lines, ascending by multipv. Empty when the engine returned nothing usable. */
  lines: EngineLine[];
};

export type AnalyzeOptions = {
  fen: string;
  depth?: number;
  movetimeMs?: number;
  multiPv?: number;
  /** UCI "Skill Level", 0-20. Omit for full strength. */
  skillLevel?: number;
  /** Approximate target rating. Used only if the build exposes UCI_Elo. */
  elo?: number;
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

type ParsedInfo = {
  depth?: number;
  multipv?: number;
  score?: StockfishScore;
  pv?: string[];
  bounded?: boolean;
};

function parseInfoLine(line: string): ParsedInfo {
  const out: ParsedInfo = {};

  // Bounded scores are provisional; the engine will restate them exactly.
  if (/\b(upperbound|lowerbound)\b/.test(line)) out.bounded = true;

  const depthMatch = line.match(/\bdepth\s+(\d+)\b/);
  if (depthMatch) out.depth = Number(depthMatch[1]);

  const multipvMatch = line.match(/\bmultipv\s+(\d+)\b/);
  if (multipvMatch) out.multipv = Number(multipvMatch[1]);

  const scoreMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)\b/);
  if (scoreMatch) {
    const type = scoreMatch[1] as 'cp' | 'mate';
    const value = Number(scoreMatch[2]);
    out.score = { type, value };
  }

  const pvIdx = line.indexOf(' pv ');
  if (pvIdx !== -1) {
    const pvStr = line.slice(pvIdx + 4).trim();
    if (pvStr.length > 0) out.pv = pvStr.split(/\s+/);
  }

  return out;
}

/**
 * Promise-based wrapper around the Stockfish WASM worker.
 *
 * One instance owns one worker, and a worker can only search one position at a
 * time — run separate instances for playing and analysing rather than
 * interleaving calls on one (see ./pool.ts).
 */
export class StockfishEngine {
  private worker: Worker;
  private readyPromise: Promise<void>;
  private disposed = false;
  private analysisGeneration = 0;
  /** Serialises searches — a worker can only search one position at a time. */
  private queue: Promise<unknown> = Promise.resolve();

  /** UCI option names the build advertises, lowercased. Populated during handshake. */
  private supportedOptions = new Set<string>();

  // Options are sticky on the worker, so only resend them when they change.
  private currentMultiPv = 1;
  private currentSkillLevel: number | null = null;
  private currentElo: number | null = null;

  constructor() {
    // stockfish.js is served from public/stockfish (copied there on postinstall)
    this.worker = new Worker('/stockfish/stockfish.js', { type: 'classic' });

    this.readyPromise = new Promise((resolve, reject) => {
      let sawUciOk = false;

      const onMessage = (ev: MessageEvent) => {
        forEachEngineLine(ev.data, (line) => {
          const opt = line.match(/^option name (.+?) type /);
          if (opt) {
            this.supportedOptions.add(opt[1].toLowerCase());
            return;
          }
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
      this.worker.addEventListener('error', (e) => reject(e));

      this.worker.postMessage('uci');
    });
  }

  async ready() {
    await this.readyPromise;
  }

  /** True when the build can cap its own strength by rating rather than skill level. */
  get supportsElo() {
    return this.supportedOptions.has('uci_elo') && this.supportedOptions.has('uci_limitstrength');
  }

  private waitReady(): Promise<void> {
    return new Promise((resolve) => {
      const onMessage = (ev: MessageEvent) => {
        forEachEngineLine(ev.data, (line) => {
          if (line === 'readyok') {
            this.worker.removeEventListener('message', onMessage);
            resolve();
          }
        });
      };
      this.worker.addEventListener('message', onMessage);
      this.worker.postMessage('isready');
    });
  }

  private async applyOptions(opts: AnalyzeOptions) {
    const multiPv = Math.max(1, opts.multiPv ?? 1);
    let dirty = false;

    if (multiPv !== this.currentMultiPv) {
      this.worker.postMessage(`setoption name MultiPV value ${multiPv}`);
      this.currentMultiPv = multiPv;
      dirty = true;
    }

    // Prefer rating-limited play when the build supports it: it produces more
    // human-like weak play than Skill Level alone.
    if (this.supportsElo && opts.elo !== undefined) {
      if (opts.elo !== this.currentElo) {
        this.worker.postMessage('setoption name UCI_LimitStrength value true');
        this.worker.postMessage(`setoption name UCI_Elo value ${Math.round(opts.elo)}`);
        this.currentElo = opts.elo;
        dirty = true;
      }
    } else if (this.currentElo !== null) {
      this.worker.postMessage('setoption name UCI_LimitStrength value false');
      this.currentElo = null;
      dirty = true;
    }

    const skill = opts.skillLevel ?? 20;
    if (skill !== this.currentSkillLevel) {
      this.worker.postMessage(`setoption name Skill Level value ${Math.round(skill)}`);
      this.currentSkillLevel = skill;
      dirty = true;
    }

    if (dirty) await this.waitReady();
  }

  /**
   * Ask the engine to cut the current search short. The in-flight search still
   * settles normally when its `bestmove` arrives — the generation counter is
   * deliberately left alone, because bumping it here would make the running
   * search ignore its own `bestmove` and never finish.
   */
  stop() {
    if (this.disposed) return;
    this.worker.postMessage('stop');
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.worker.terminate();
  }

  /**
   * Queue a search. Concurrent callers (a batch run and an on-demand look at the
   * position on screen, say) would otherwise interleave `position`/`go` commands
   * on the same worker and corrupt each other's results.
   */
  async analyzePosition(opts: AnalyzeOptions): Promise<StockfishAnalysis> {
    const run = () => this.runAnalysis(opts);
    const result = this.queue.then(run, run);
    // Keep the chain alive regardless of how this call settles.
    this.queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async runAnalysis(opts: AnalyzeOptions): Promise<StockfishAnalysis> {
    const { fen, depth = 12, movetimeMs, multiPv = 1, signal } = opts;

    await this.ready();
    if (this.disposed) throw new Error('StockfishEngine is disposed');

    if (signal?.aborted) {
      throw signal.reason ?? new DOMException('Aborted', 'AbortError');
    }

    await this.applyOptions(opts);

    // `ucinewgame` followed by `isready` is the UCI handshake that guarantees the
    // engine is idle. Sending `position`/`go` while a previous search is still
    // running makes the WASM build trap with "unreachable".
    this.worker.postMessage('ucinewgame');
    await this.waitReady();

    const myGen = ++this.analysisGeneration;

    return await new Promise<StockfishAnalysis>((resolve, reject) => {
      // The signal can fire while the awaits above are in flight. Attaching a
      // listener to an already-aborted signal never calls it, which would leave
      // this promise pending forever and stall every search queued behind it.
      if (signal?.aborted) {
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
        return;
      }

      // Latest accepted result per MultiPV slot.
      const byMultiPv = new Map<number, EngineLine>();
      let bestMove: string | null = null;
      let watchdog: ReturnType<typeof setTimeout> | null = null;

      let aborted = false;

      const onAbort = () => {
        // Do not settle yet: wait for the engine's own `bestmove` so the worker
        // is genuinely idle before anything queued behind this starts.
        aborted = true;
        this.worker.postMessage('stop');
      };

      const finish = () => {
        // Slots hold the deepest line seen for each MultiPV index, but a search
        // cut off mid-iteration can leave a stale slot still holding the move
        // that now occupies a better slot — Stockfish transiently reports the
        // same move under two indices. Collapsing by first move keeps the
        // engine's ranking while guaranteeing the candidates are distinct.
        const ordered = [...byMultiPv.values()].sort((a, b) => {
          if (a.multipv !== b.multipv) return a.multipv - b.multipv;
          return b.depth - a.depth;
        });

        const seen = new Set<string>();
        const unique: EngineLine[] = [];
        for (const line of ordered) {
          const firstMove = line.pv[0];
          if (!firstMove || seen.has(firstMove)) continue;
          seen.add(firstMove);
          unique.push(line);
        }

        // The `bestmove` line is authoritative; make sure it leads.
        if (bestMove) {
          const best = unique.findIndex((l) => l.pv[0] === bestMove);
          if (best > 0) unique.unshift(...unique.splice(best, 1));
        }

        const lines = unique.map((line, i) => ({ ...line, multipv: i + 1 }));
        const top = lines[0] ?? null;
        resolve({
          bestMove,
          score: top?.score ?? null,
          depth: top?.depth ?? null,
          pv: top?.pv ?? null,
          lines,
        });
      };

      const onMessage = (ev: MessageEvent) => {
        if (this.disposed) return;
        if (myGen !== this.analysisGeneration) return; // stale

        forEachEngineLine(ev.data, (line) => {
          if (line.startsWith('info ')) {
            const info = parseInfoLine(line);
            if (info.bounded) return;
            if (!info.score || !info.pv || info.pv.length === 0) return;

            const slot = info.multipv ?? 1;
            const prev = byMultiPv.get(slot);
            const nextDepth = info.depth ?? 0;
            // Keep the deepest result seen for each slot.
            if (prev && prev.depth > nextDepth) return;

            byMultiPv.set(slot, {
              multipv: slot,
              score: normalizeScoreToWhitePov(fen, info.score),
              depth: nextDepth,
              pv: info.pv,
            });
            return;
          }

          if (line.startsWith('bestmove')) {
            const parts = line.split(/\s+/);
            bestMove = parts[1] && parts[1] !== '(none)' ? parts[1] : null;
            cleanup();
            if (aborted) {
              reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
            } else {
              finish();
            }
          }
        });
      };

      const cleanup = () => {
        if (watchdog) clearTimeout(watchdog);
        watchdog = null;
        this.worker.removeEventListener('message', onMessage);
        signal?.removeEventListener('abort', onAbort);
      };

      this.worker.addEventListener('message', onMessage);
      signal?.addEventListener('abort', onAbort, { once: true });

      // A `bestmove` that never arrives — because the search was stopped, or the
      // worker wedged — must not block the queue indefinitely.
      const budget = movetimeMs && movetimeMs > 0 ? movetimeMs : 30_000;
      watchdog = setTimeout(() => {
        cleanup();
        finish();
      }, budget + 15_000);

      this.worker.postMessage(`position fen ${fen}`);

      if (movetimeMs && movetimeMs > 0) {
        this.worker.postMessage(`go movetime ${Math.floor(movetimeMs)}`);
      } else {
        this.worker.postMessage(`go depth ${Math.floor(depth)}`);
      }

      void multiPv; // already applied via applyOptions
    });
  }

  /** Ask the engine for a move to actually play, at the given strength. */
  async chooseMove(opts: AnalyzeOptions): Promise<string | null> {
    const res = await this.analyzePosition({ ...opts, multiPv: 1 });
    return res.bestMove;
  }
}
