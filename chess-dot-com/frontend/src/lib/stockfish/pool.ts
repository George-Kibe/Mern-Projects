import { StockfishEngine } from './engine';

/**
 * A worker can only search one position at a time, so playing and analysing get
 * their own engine. They are created lazily — loading the WASM costs ~7MB, and
 * most sessions only ever use one of the two.
 */
type EngineKey = 'play' | 'analysis';

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
