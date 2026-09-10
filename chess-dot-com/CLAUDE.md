# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is for

A **personal chess training site**, not a product. One user: the repo owner.

The goal is to play Stockfish at a controllable strength and then have the engine
explain the game move by move — what was a mistake, why, and what should have
been played instead. Optimise every decision for *learning value to a single
player*, not for scale, multi-tenancy, or public deployment.

Concretely:

- **Explanation quality is the product.** A better-worded reason for a move is
  worth more than a faster render or a prettier panel.
- **Don't build** account systems, login, payments, moderation, ELO ladders, or
  anti-cheat. There is one user and no adversary. Login was deliberately removed.
- **Don't add** a database, Docker, or CI unless asked. localStorage is a
  deliberate choice, not an oversight.
- **Everything lives on one screen.** Three panels behind tabs, no router. If a
  feature seems to want its own page, it wants a panel instead.

## Repository layout — read before any git operation

**This directory is not its own git repository.** The repo root is
`~/Desktop/Projects/Mern-Projects/`, which holds nine unrelated projects
(`penny-wise`, `lama-blog`, `spotify-chat-socketio`, …) on one `master` branch.

- `git status` from here shows other projects' changes. Never `git add -A`.
  Stage explicit paths under `chess-dot-com/` only.
- Scope commit messages, e.g. `chess: add opening book`.
- The shared root `.gitignore` covers `node_modules`, `dist`, `*.tsbuildinfo`.
  Project-specific ignores go in `frontend/.gitignore`.

## Commands

```bash
# frontend/ — the application
npm run dev         # Vite on :5173
npm run build       # tsc -b && vite build
npm run typecheck
npm run lint

# backend/ — only needed for "Play a friend"
npm run dev         # tsx watch, restarts on save
npm run build
npm start
```

Run `typecheck` **and** `lint` in `frontend/` before calling frontend work done,
and `build` in `backend/`. All are currently clean — keep them that way.

There is no test suite. Verify by running the app. A headless check is genuinely
possible here and worth doing for anything touching the engine: Chrome is
installed at `/usr/bin/google-chrome`, so `npm run preview` plus `puppeteer-core`
(install it in a scratch directory, **not** in the project) can drive the real UI
and confirm the WASM worker loads and replies.

## Architecture

Two standalone npm packages, no workspace tooling.

**Stockfish runs entirely in the browser.** The backend has no engine and no
knowledge of analysis — it only pairs two humans and relays validated moves.
Playing the engine and analysing both work with the backend switched off. Do not
move engine work to the server.

Two workers are created lazily by `lib/stockfish/pool.ts`: `'play'` and
`'analysis'`. A worker searches one position at a time, so the live evaluation
bar must use the analysis engine or it will fight the opponent's own search.
Never interleave calls on one instance.

### The analysis pipeline

`PGN → parsePgn → FEN per ply → analyzePosition each → annotateMoves → describeMove → buildNarration → UI/voice`

| File | Why it matters |
| --- | --- |
| `lib/stockfish/engine.ts` | UCI wrapper. Handshake, MultiPV parsing, skill/Elo options, abort, stale-generation counting. |
| `lib/chess/describeMove.ts` | Works out what a move *does* from the board. The reason candidate moves can explain themselves. |
| `lib/analysis/classifyMove.ts` | Move-quality judgement. |
| `lib/analysis/narrate.ts` | Assembles spoken coaching. |
| `lib/speech/sanToSpeech.ts` | Notation → readable English. |
| `panels/Analyze.tsx` | Orchestrates all of the above. |

## Conventions that are easy to get wrong

**Engine scores are normalised to White's POV** in `engine.ts`, once, at the
boundary. Everything downstream assumes it. Centipawn *loss*, by contrast, is
computed from the **mover's** perspective in `classifyMove.ts`. Conflating the
two typechecks perfectly and silently inverts every Black annotation.

**Mate scores use a ±100000 sentinel** (`MATE_CP` in `lib/analysis/score.ts`);
`isMateScore()` treats `|cp| >= 90000` as mate. This sentinel must never reach
arithmetic meant for centipawns — it has already caused two real bugs ("costs
1000.2 pawns", a "−1001.50" eval drop, and a zeroed accuracy score). Whenever you
subtract, average, or format evaluations, check `isMateScore` first and say
something qualitative instead.

**One worker, one search — enforced by a queue.** `analyzePosition` serialises
through `this.queue`. Two concurrent searches on a worker make the WASM build
trap with `unreachable`, killing the engine silently. Three rules keep it alive,
and all three were learned from real breakage:

- Each search sends `ucinewgame` then waits for `readyok` *before* `position`/`go`,
  so the engine is provably idle.
- Aborting does **not** settle the promise. It posts `stop` and waits for the
  engine's own `bestmove`, so the next queued search never starts against a
  still-searching worker.
- `stop()` must not bump `analysisGeneration` — doing so makes the running search
  ignore its own `bestmove` and hang the whole queue.

A watchdog settles the promise if `bestmove` never arrives, so a wedged worker
cannot deadlock everything behind it.

**Never narrate from a partly-filled analysis.** `narration` requires both
`analysis[ply - 1]` and `analysis[ply]`; without that gate the coach confidently
called a mate-in-one blunder "a reasonable move, no evaluation". The auto-speak
guard is keyed on the narration *text*, not the ply, so advice that improves once
the engine catches up is spoken while a re-render is not.

**A tactic is not the same as a winning evaluation.** `detectTactic` subtracts
the material already on the board from the engine's score, so being a rook up
with nothing to do does not register — only advantage *available beyond* current
material counts. `findTacticMoments` de-duplicates per side (tracking `w` and `b`
separately), because the sides alternate and comparing against the immediately
preceding ply reports one continuing tactic as a new one every second move.

**Move numbers from a position index:** `Math.floor(ply / 2) + 1`, with White to
move when `ply` is even. Getting this subtly wrong labelled a jump-back button
"move 6" for move 7.

**Voice has two channels.** Browser speech first; if the browser exposes no
voices, the app POSTs to the backend's `/speech/say`, which speaks via `spd-say`
on the host. That exists because Chrome on Linux hides every system voice unless
launched with `--enable-speech-dispatcher`, which a web page can neither detect
nor fix. Analysis still works with the backend off — only the fallback voice needs it.

The host voice takes volume/rate/pitch/module/voice (speech-dispatcher scales are
-100..100; volume defaults to 100 because the default is very quiet).
`/speech/voices` lists modules and English base voices — `spd-say -L` returns
thousands of `Base+Variant` rows for espeak-ng, so it is filtered server-side by a
strict `^en(-…)?$` language match; a loose prefix test lets voices whose names
spill into the language column through.

**MultiPV slots can transiently hold duplicate moves.** Stockfish sometimes
reports the same move under two `multipv` indices mid-iteration, and a search cut
off by `movetime` can leave that stale slot in place — which shipped once as two
identical "O-O" candidates with different evals. `analyzePosition` now collapses
lines by first move at finish and renumbers them, so `lines` is always distinct
and `lines[0]` always matches `bestmove`. Don't reintroduce per-slot reporting
without that de-duplication.

**Speech fails silently, so it must be diagnosed, not assumed.** `speak()`
returns normally when there are no voices, when the tab is muted, and when the
page has had no user gesture. `useSpeech` detects each case (including a timeout
when nothing starts playing) and `describeSpeechProblem` turns it into advice
that the Coach panel renders.

The dominant cause on this machine is **Chrome on Linux needing
`--enable-speech-dispatcher`** — measured: 0 voices without it, 14805 with it,
while speech-dispatcher and espeak-ng were correctly installed the whole time.
Don't tell the user to install packages before checking that. Puppeteer can
verify speech end to end by passing that flag, so this *is* testable headlessly.

espeak-ng advertises every base voice crossed with every variant (~945 English
entries). `pickVoices` keeps base voices only and caps the list; don't render
`voices` raw into a `<select>`.

**Positions are off-by-one from moves, by design.** `fens[ply]` is the position
*before* move `ply`; `fens[ply + 1]` is after. `analysis[i]` describes `fens[i]`,
so the candidate moves shown at position *i* are the alternatives to the move
actually played there.

**Tailwind 4 is CSS-configured.** No `tailwind.config.js`. Tokens go in the
`@theme` block in `src/index.css`; `--color-panel` yields `bg-panel`. Utilities
for tokens that don't exist silently emit nothing — that was a real bug once.

**Redux Toolkit with pre-typed hooks.** Use `useAppSelector`/`useAppDispatch`
from `src/store`, never the bare `react-redux` hooks. State that should survive a
refresh goes in a slice; `store/persist.ts` writes `engine` and `games` to
localStorage. Keep `persist.ts` free of imports from `store/index.ts` or the
types go circular.

**ESLint 10 + react-hooks 7 are strict about two things**, and both rules are
right — fix the pattern, don't disable the rule:
- *No reading `ref.current` during render.* Mirror what you need into state
  (`PlayEngine` syncs `fen`/`sans`/`turn` from the `Chess` ref) or derive it.
- *No synchronous `setState` in an effect.* Either derive the value, or adjust
  state during render when a prop changes (`Board` resets its selection this way,
  `Analyze` loads a handed-over PGN this way).

**Backend imports need `.js` extensions** — ESM with `"module": "nodenext"`, so
`import { Game } from "./Game.js"` even though the source is `.ts`.

**Stockfish assets are generated, not committed.** `scripts/copy-stockfish.mjs`
runs on `postinstall` and copies the **lite single-threaded** build into
`public/stockfish/`, which is gitignored. If the engine 404s, run `npm install`.
Don't switch to the multi-threaded build casually: it needs `SharedArrayBuffer`,
which needs COOP/COEP headers, which breaks local ease of use.

## Dependency policy

Brought to latest-compatible in September 2026. Two pins are deliberate:

- **TypeScript `~6.0.3`, not 7.x.** TS 7 is npm `latest`, but
  `typescript-eslint@8` peers `typescript >=4.8.4 <6.1.0`. Upgrading breaks
  linting in both packages. Unpin once typescript-eslint supports TS 7.
- **`chess.js` 1.4.0** is genuinely the latest release, not a stale pin.

`npm outdated` will always flag `typescript` and `@types/node` (DefinitelyTyped's
`latest` tag points at 22.x while this runs on Node 24). Both are correct.

Vite 8 requires Node ≥ 22.12; ESLint 10 requires ≥ 20.19.

## chess.js notes

`attackers(square, color)` returns the *squares* of pieces of `color` attacking
`square`, works for empty squares, and doubles as a defender query when you pass
the colour of the piece standing there. That single call underpins the hanging,
fork and escape detection in `describeMove.ts`.

Careful: in an illegal position chess.js will happily generate a **king
capture**. `describeMove` guards against it; anything else that iterates moves
should too.

## Where to take it next

The readme's *Known gaps* section is the current list. The most valuable ones for
a training tool, roughly in order:

1. **An opening book / named openings**, so early moves aren't judged purely on
   evaluation and you learn what you're actually playing.
2. **Parallel analysis** across more than one worker, for long games.
3. **Better "brilliant" detection** — the current heuristic is material sacrifice
   plus eval improvement, which misses quiet brilliancies.
4. **A tactics-from-your-own-blunders trainer**: every key moment is already a
   ready-made puzzle with a known solution.

When touching analysis, sanity-check against a real game with a known blunder —
eval-sign and sentinel bugs typecheck perfectly and are invisible without one.
Scholar's mate (`1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#`) is a fast fixture:
`3... Nf6` must come out as a blunder that "allows a forced mate".
