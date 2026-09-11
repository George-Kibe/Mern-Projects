# chess-dot-com

**Live: https://george-chess.vercel.app**

A personal chess site built for training rather than for an audience of players.

The point is not to recreate a public chess server. It is to **play against
Stockfish at a chosen strength, then walk back through the game with the engine
explaining what went wrong and what the better plan was** — every move tagged,
every mistake accompanied by the line that should have been played, out loud if
you want it.

Everything happens on one screen. The engine runs in the browser as WebAssembly,
so analysis costs nothing, works offline, and never uploads your games.

---

## What it does

**One home screen, five panels, no navigation.**

### Play the engine
Eight strength tiers from *Beginner* to *Full strength*. Pick a side, play a
game, take moves back, ask for a hint (which explains itself: *"Nc7 — forks the
king on e8 and the rook on a8"*), and optionally show a live evaluation bar.

**Time controls** from 1-minute bullet to 30-minute classical, with increments,
or no clock at all. The clock starts on your first move; running out ends the
game as a loss on time.

**Blunder coaching is on while you play.** Every move you make is checked against
the engine, and anything that drops material stops you with what it cost, what
was better and why — then offers **↩ Take it back and try again** so you can play
the position properly instead of losing and wondering. Turn it off with *Coach my
blunders* if you would rather find out afterwards.

When you're done, one button sends the game straight to the analysis board.

### Analyze
Paste a PGN, upload a `.pgn`, replay a saved game, or hand over the game you
just played. Stockfish evaluates every position and the board fills in:

- **Move quality tags** — brilliant, best, excellent, good, inaccuracy, mistake,
  blunder — shown inline in the move list with `?!`, `?`, `??` marks.
- **Accuracy scores** for both sides, and a **key moments** list that jumps
  straight to the turning points.
- **The engine's top two moves arrowed on the board**, numbered ① and ② in
  matching colours, so you can see both candidates at a glance without reading
  notation.
- **The engine's candidate moves, each explained in words** — not just
  *"Qg5, −1.51"* but *"Saves the queen. Moves the queen off h5, where it was
  under attack."* The explanations are derived from the board, not the score, so
  even a move the engine merely tolerates gets a real reason attached.
- **Coaching narration** for each move, and **a voice that reads it aloud** as
  you step through the game.
- **Learning moments.** The coach stops you at what actually teaches: blunders,
  mistakes, missed wins, brilliancies, forced mates and winnable tactics. Each
  one is flagged **on the board itself** with a badge — `BLUNDER`, `MATE IN 3`,
  `TACTIC`, `BRILLIANT` — so you notice it without reading a side panel.
- **Every verdict comes with the proof.** A blunder offers *What it allows* (the
  refutation the engine would play) and *Play Nf3 instead* (what should have been
  played). A tactic offers *Show the winning line*. You step through the moves
  with controls that sit directly under the heading, the coach explaining each
  move as you go, then **↩ Back to the game** returns you to exactly where you
  were.
- **A Learning moments list** for the whole game — every teaching point, in
  order, one click from the position.

### Learn openings
Seventeen main-line openings — Italian, Ruy Lopez, Scotch, Petrov, Najdorf,
Dragon, French, Caro-Kann, Scandinavian, QGD, Slav, King's Indian, Nimzo,
Grünfeld, London, Catalan, English — each with its ECO code and the side you
play.

- **Learn** steps through the main line with a note on why each key move is
  played.
- **Practise** hides the moves and makes you play your side from memory. The
  opponent replies automatically, and a wrong move is explained from the board
  (*"Not e5 — Claims the centre with the pawn on e5. This line plays c5"*) rather
  than just rejected. It keeps a first-time-correct score.
- Every opening lists its **middlegame plans** and the **mistake that actually
  costs games** in that structure.
- At the end of a line, **Play on from here** continues against the engine from
  the final position, so you see the middlegame the opening leads to — and that
  game can be sent straight to the analysis board.

### Puzzles
Tactics to solve, generated on demand so **no two are ever the same** — there is
no fixed puzzle set to exhaust.

- **Target difficulty** from ~600 to ~2600, **game phase** (opening, middlegame,
  endgame) and **tactic type** (checkmate or win material) are all selectable.
- Play the answer on the board. A wrong move is named and you can try again;
  **Hint** shows the piece to move, a second press draws the arrow, and **Show
  solution** plays the whole line out.
- Multi-move solutions play the opponent's forced replies for you.
- Solved / accuracy / streak / best streak are kept across sessions.
- An optional **time limit** per puzzle (15s to 3 minutes) — running out counts
  as a failed attempt.
- The next puzzle is generated in the background while you solve, so *Next* is
  usually instant.

How it works: a plausible game is played out to the requested phase (or, for
endgames, a legal position is composed directly), one side is nudged into a
mistake, and the position is kept only if a single move is decisively better
than every alternative. Difficulty is estimated from how long the forced line
runs, whether the key move is quiet, and how large the gap to the second-best
move is — **a guide, not a calibrated rating**.

### Play a friend
Human-vs-human over the local WebSocket server, in two browser tabs or across
your network, with the same time controls. These games can be analyzed too.
Each browser keeps its own clock, so agree the control between you — the server
does not enforce it.

---

## Getting started

**Requires Node.js ≥ 22.12** (Vite 8 and ESLint 10 both refuse older runtimes).
Developed on Node 24.18.

```bash
# The web app — this is all you need for playing the engine and analyzing
cd frontend
npm install
npm run dev            # http://localhost:5173

# Only needed for the "Play a friend" panel
cd backend
npm install
npm run dev            # ws://localhost:8000
```

`npm install` in `frontend/` runs a `postinstall` step that copies the Stockfish
WASM build out of `node_modules` into `public/stockfish/`. Those two files are
generated and gitignored — if the engine ever fails to start, re-run
`npm install`.

### Scripts

**frontend/** — `dev`, `build`, `preview`, `typecheck`, `lint`
**backend/** — `dev` (tsx watch), `build`, `start`, `typecheck`, `clean`

### Configuration

One optional variable, read by [frontend/src/hooks/useSocket.ts](frontend/src/hooks/useSocket.ts):

```bash
# frontend/.env.local
VITE_APP_WS_URL=ws://localhost:8000
```

It defaults to `ws://localhost:8000`, so local development needs no `.env` file.

### The coaching voice

The voice is rendered **on the server and played by the browser**. That is
deliberate: it needs no browser launch flags, no system voice list, and the tab's
own volume control applies — the three things that made every other route
unreliable.

The server picks the best engine installed, preferring:

| Engine | Quality | Install |
| --- | --- | --- |
| **Piper** | Neural, close to natural | binary + voice model under `~/.local` (see below) |
| **SVOX Pico** | Clear and smooth | `sudo apt install libttspico-utils` |
| **eSpeak NG** | Robotic but tiny | `sudo apt install espeak-ng` |

Whichever are present appear in a **Voice engine** dropdown, alongside volume and
speed. If none is installed the app falls back to speaking through
speech-dispatcher, and finally to the browser's own voices.

#### Piper setup

Piper is already installed here. It lives entirely under your home directory —
nothing system-wide, no `sudo`:

```
~/.local/share/piper/piper/piper                        # the binary
~/.local/share/piper/voices/en_US-lessac-medium.onnx    # the voice model
```

The paths are in `backend/.env`, which the server reads at startup:

```bash
PIPER_BIN=$HOME/.local/share/piper/piper/piper
PIPER_VOICE=$HOME/.local/share/piper/voices/en_US-lessac-medium.onnx
```

That file is gitignored. To rebuild it on another machine, download
`piper_linux_x86_64.tar.gz` from the
[Piper releases](https://github.com/rhasspy/piper/releases), unpack it there, and
fetch a voice from
[rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices) — you need
both the `.onnx` and its `.onnx.json`. Other voices drop in by changing
`PIPER_VOICE`; `en_GB-alba-medium` and `en_US-amy-medium` are good alternatives.

**The backend must be running for the voice.** Analysis and engine play do not
need it.

#### If it is still silent

- Check the **🔊 Voice on** button in the Coach panel header.
- The Coach panel names the problem when there is one.
- Chrome on Linux exposes no browser voices unless started with
  `--enable-speech-dispatcher`; with server rendering you no longer need that.

### Exporting games

Every game can be saved as a `.pgn` file for later:

- **Analyze → Download PGN** exports the loaded game *with the engine's verdicts
  folded in as move comments* — `Nf6 {blunder ?? | M1 | allows forced mate}` —
  which Lichess, SCID and ChessBase all preserve.
- **Play the engine / Play a friend → Download PGN** saves the game you just
  played.
- Each entry in *Your games* has its own download link.

### If the page is blank

Saved settings live in localStorage and are merged onto current defaults, so an
older saved shape should no longer break anything. If the page ever does come up
empty, the error screen offers **Clear saved data and reload**; the same thing by
hand is, in the browser console:

```js
localStorage.removeItem('chess-trainer:v1'); location.reload();
```

That loses your preferences and the local game list, nothing else.

### Where your data lives

There is no database. Games and settings are kept in `localStorage` under the key
`chess-trainer:v1`, so they survive a refresh but never leave the machine. The
library keeps the 50 most recent games. Clearing site data clears everything.

---

## Deploying

### Frontend → Vercel

The web app is a static build with no server dependency, so it deploys to
Vercel's free tier as-is. Playing the engine, analysis, openings and puzzles all
run entirely in the visitor's browser.

It is already deployed as the Vercel project **george-chess**. To redeploy after
a change:

```bash
cd frontend
vercel --prod --yes
vercel alias set <the-new-deployment-url> george-chess.vercel.app
```

The alias step keeps `george-chess.vercel.app` pointing at the newest build.
`frontend/vercel.json` sets the framework, build command, output directory and
long-lived caching for the engine assets, and `frontend/.vercel/` holds the
project link.

Setting it up from scratch instead: import the repo in Vercel, set **Root
Directory** to `frontend`, and deploy. Note that new projects start with
Deployment Protection on, which makes the site return a login redirect to
everyone — turn it off with `vercel project protection disable <name> --sso`.

Nothing else is required — the Stockfish WASM files are generated during the
build (`npm run build` runs the copy step itself, so it does not depend on
`postinstall`), and no cross-origin isolation headers are needed because the
single-threaded engine build is used.

### Backend → not Vercel

**The game server cannot run on Vercel.** It is a long-lived WebSocket server,
and Vercel's serverless functions cannot hold a socket open; it also shells out
to local text-to-speech binaries. This is a platform limitation, not a
configuration problem.

It is only needed for two things — *Play a friend*, and the server-rendered
voice. **If you skip it, everything else still works**, and the app says so
rather than failing.

To deploy it, use a free tier that supports WebSockets. `backend/render.yaml` is
ready for [Render](https://render.com):

1. New → Blueprint, point it at the repository. It reads `render.yaml`.
2. Copy the resulting URL.
3. In Vercel, set `VITE_APP_WS_URL` to that URL with the `wss://` scheme
   (`wss://your-service.onrender.com`) and redeploy.

`backend/Dockerfile` is the portable equivalent for Fly.io, Railway or Cloud
Run. Render's free tier sleeps when idle, so the first connection after a pause
takes a few seconds to wake.

A deployed server will not have Piper or Pico installed, so the voice falls back
to the browser's own. The Dockerfile has a commented line to add `pico2wave` if
you want a server-rendered voice.

## Architecture

```
chess-dot-com/
├── frontend/     React 19 + Vite 8 SPA. Owns the board, the analysis pipeline,
│                 and the Stockfish WASM workers. This is the application.
└── backend/      Node WebSocket server (ws). Matchmaking and move relay for
                  human-vs-human games only.
```

**Stockfish runs entirely in the browser.** The backend has no engine and knows
nothing about analysis — playing the engine and reviewing games both work with
the server switched off. Two engine workers are created lazily: one plays, one
analyses, so a live evaluation never competes with the opponent's own search.

### WebSocket protocol

Client → server:

```jsonc
{ "type": "init_game" }                                  // join the matchmaking queue
{ "type": "move", "payload": { "from": "e2", "to": "e4" } }
```

Server → client:

```jsonc
{ "type": "init_game", "payload": { "color": "white" } }
{ "type": "move",      "payload": { /* full chess.js move */ } }
{ "type": "game_over", "payload": { "winner": "white" | "black" | "draw" } }
{ "type": "ERROR",     "payload": "Illegal move. It's not your turn!" }
```

---

## How the analysis works

This is the part worth understanding, since it is the reason the project exists.

1. **Parse** — [`parsePgn`](frontend/src/lib/pgn/parsePgn.ts) replays the game
   from the start, capturing a FEN after every ply. *n* moves yield *n+1*
   positions.

2. **Evaluate** — [`StockfishEngine`](frontend/src/lib/stockfish/engine.ts)
   wraps the WASM worker in a promise-based API with MultiPV support. UCI reports
   scores from the side-to-move's perspective; the wrapper normalises everything
   to **White's point of view** once, at the boundary.

3. **Classify** — [`annotateMoves`](frontend/src/lib/analysis/classifyMove.ts)
   diffs consecutive evaluations. Centipawn loss *from the mover's perspective*
   sets the tag:

   | Loss (cp) | Tag |
   | --- | --- |
   | ≤ 5 | best |
   | ≤ 20 | excellent |
   | ≤ 80 | good |
   | ≤ 200 | inaccuracy |
   | ≤ 350 | mistake |
   | > 350 | blunder |

   A **missed chance** is flagged when you were already clearly winning (≥ 150cp)
   and gave away ≥ 80cp. **Brilliant** is a heuristic: you shed ≥ 3 points of
   material *and* the evaluation improved by ≥ 80cp.

4. **Describe** — [`describeMove`](frontend/src/lib/chess/describeMove.ts) works
   out what a move actually *does*, from the board rather than the evaluation:
   what it captures and whether the capture is free, what it now attacks, whether
   it forks two pieces, whether it rescues a piece that was under fire, and what
   it leaves undefended. This is what makes the candidate moves explain
   themselves.

5. **Narrate** — [`buildNarration`](frontend/src/lib/analysis/narrate.ts)
   assembles the spoken coaching, and
   [`sanToSpeech`](frontend/src/lib/speech/sanToSpeech.ts) translates notation
   into something a synthesiser can read: `Nxe4` becomes *"knight takes e 4"*,
   not *"en ex ee four"*.

The search budget defaults to **350ms per position** — a full game in a few
seconds, accurate enough to catch real mistakes. Raise it for a closer look.

### Why the single-threaded engine build

`scripts/copy-stockfish.mjs` copies the **lite, single-threaded** Stockfish
build. The multi-threaded build is stronger but needs `SharedArrayBuffer`, which
needs cross-origin isolation (`COOP`/`COEP` headers) — server configuration that
breaks the "just open it" workflow. Revisit only if analysis quality becomes the
bottleneck.

---

## Tech stack

**Frontend** — React 19.3, Vite 8.3, TypeScript 6.0, Tailwind CSS 4.3,
Redux Toolkit 2.12, chess.js 1.4, stockfish 18 (WASM).

**Backend** — Node 24, TypeScript 6.0, `ws` 8.21, chess.js 1.4, `tsx` for dev.

### A note on TypeScript 6

Pinned to **TypeScript 6.0.3, not 7.x**, on purpose. TypeScript 7 (the Go
rewrite) is npm `latest`, but `typescript-eslint@8` declares a peer range of
`>=4.8.4 <6.1.0`; installing TS 7 breaks linting in both packages. 6.0.3 is the
newest version the whole toolchain agrees on.

Tailwind 4 is configured entirely in CSS — there is no `tailwind.config.js` and
there should not be one. Theme tokens live in an `@theme` block in
[frontend/src/index.css](frontend/src/index.css).

---

## Project layout

```
frontend/src/
├── panels/
│   ├── PlayEngine.tsx      Play Stockfish at a chosen strength
│   ├── Analyze.tsx         The analysis board
│   └── PlayFriend.tsx      WebSocket human-vs-human
├── screens/Home.tsx        The single screen; owns the tab state
├── components/
│   ├── Board.tsx           Interactive board: drag, legal hints, promotion, arrows
│   ├── Alternatives.tsx    Candidate moves with written explanations
│   ├── MoveList.tsx        Move list with quality tags
│   ├── EvalBar.tsx         Vertical evaluation bar
│   └── ui.tsx              Panel, Button, Toggle, Select, Field
├── lib/
│   ├── stockfish/          engine.ts (UCI wrapper), pool.ts (workers), levels.ts
│   ├── chess/describeMove.ts   Tactical and positional description
│   ├── analysis/           classifyMove.ts, narrate.ts, score.ts
│   ├── speech/             useSpeech.ts, sanToSpeech.ts
│   └── pgn/parsePgn.ts
├── store/                  Redux Toolkit + localStorage persistence
└── hooks/useSocket.ts

backend/src/
├── index.ts        WebSocketServer bootstrap
├── GameManager.ts  Matchmaking queue, routing, disconnect cleanup
├── Game.ts         One game: board state, turn enforcement, broadcast
└── messages.ts     Shared message-type constants
```

---

## Known gaps

1. **No opening book or named openings.** The engine plays from move one and the
   analysis has no concept of theory, so early moves get judged purely on
   evaluation.
2. **Analysis is sequential** — one position at a time on a single worker. Fine
   for a 40-move game, slow for a long one.
3. **"Brilliant" is a rough heuristic** (material sacrifice + eval improvement).
   It will miss quiet brilliancies and occasionally over-reward a good trade.
4. **`/games/:gameId` semantics are gone** along with routing; matchmaking is a
   single global queue, so "Play a friend" pairs you with whoever is waiting.
5. **Voice depends on the browser's installed voices.** Quality varies a lot
   between systems, and Chrome will not speak until the page has had a click.
6. **No clocks.** Games are untimed.

---

## License

MIT.

Stockfish itself is **GPLv3**. It is loaded as a separate WASM artifact at
runtime and is not linked into the application bundle, but the licence applies to
that artifact and must be preserved if this is ever distributed.
