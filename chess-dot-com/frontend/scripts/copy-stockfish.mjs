import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const srcDir = path.join(root, 'node_modules', 'stockfish', 'bin');
const destDir = path.join(root, 'public', 'stockfish');

// Use the single-threaded (lite) build for maximum browser compatibility.
// Multi-threaded WASM requires cross-origin isolation (COOP/COEP + SharedArrayBuffer).
const files = [
  { from: path.join(srcDir, 'stockfish-18-lite-single.js'), to: path.join(destDir, 'stockfish.js') },
  { from: path.join(srcDir, 'stockfish-18-lite-single.wasm'), to: path.join(destDir, 'stockfish.wasm') },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

try {
  ensureDir(destDir);
  for (const f of files) {
    if (!fs.existsSync(f.from)) {
      throw new Error(`Missing ${f.from}. Did you run npm install in frontend/?`);
    }
    fs.copyFileSync(f.from, f.to);
  }
  console.log('[copy-stockfish] Copied Stockfish assets to public/stockfish');
} catch (err) {
  console.error('[copy-stockfish] Failed:', err);
  process.exitCode = 1;
}
