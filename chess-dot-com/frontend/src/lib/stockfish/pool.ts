import { StockfishEngine } from './engine';

/**
 * A worker can only search one position at a time, so each concurrent use gets
 * its own engine: playing, analysing, and generating puzzles. They are created
 * lazily — loading the WASM costs ~7MB, and most sessions never use all three.
 */
type EngineKey = 'play' | 'analysis' | 'puzzle';

const engines = new Map<EngineKey, StockfishEngine>();

export function getEngine(key: EngineKey): StockfishEngine {
  let engine = engines.get(key);
  if (!engine) {
    engine = new StockfishEngine();
    engines.set(key, engine);
  }
  return engine;
}

export function disposeEngine(key: EngineKey) {
  engines.get(key)?.dispose();
  engines.delete(key);
}

export function disposeAllEngines() {
  for (const engine of engines.values()) engine.dispose();
  engines.clear();
}
