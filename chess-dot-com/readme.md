# chess-dot-com

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

**One home screen, three panels, no navigation.**

### Play the engine
Eight strength tiers from *Beginner* to *Full strength*. Pick a side, play a
game, take moves back, ask for a hint (which explains itself: *"Nc7 — forks the
king on e8 and the rook on a8"*), and optionally show a live evaluation bar.
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
- **Tactic alerts.** When there is something concrete to win, a banner appears —
  *"Forced mate in 3 for White"* or *"White can win a piece here"* — with a
  **Show the mating moves** button that plays the line out on the board.
- **A Tactics found list** for the whole game. Every point where a tactic first
  became available, with a jump straight back to that position.
- *Play it out* to walk any variation move by move, then **↩ Back to move N** to
  return to exactly where you were.

### Play a friend
Human-vs-human over the local WebSocket server, in two browser tabs or across
your network. These games can be analyzed too.

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

### If you can't hear the voice

The coaching voice uses the browser's built-in speech synthesis. It fails
silently in several ways, so the Coach panel names the one that applies.

**On Linux, the usual cause is Chrome, not missing voices.** Chrome hides every
system voice unless it is started with a flag — `speechSynthesis.getVoices()`
returns `0` and `speak()` produces silence with no error. Verified on this
machine: 0 voices without the flag, 14,805 with it.

```bash
# Quit Chrome completely first — a running instance will just open a new tab.
google-chrome --enable-speech-dispatcher
```

To make it permanent without `sudo` (and without the change being undone by a
Chrome update), give yourself a local launcher:

```bash
cp /usr/share/applications/google-chrome.desktop ~/.local/share/applications/
sed -i 's|/usr/bin/google-chrome-stable|/usr/bin/google-chrome-stable --enable-speech-dispatcher|' \
  ~/.local/share/applications/google-chrome.desktop
update-desktop-database ~/.local/share/applications 2>/dev/null
```

**Choosing a better voice.** The bundled `espeak-ng` is robotic and quiet by
design. When the app is using the host voice it shows a voice picker plus
**volume, speed and pitch** sliders and a *Test this voice* button — volume
defaults to maximum, which fixes most "I can barely hear it" cases.

For a genuinely natural voice, install RHVoice and restart the server:

```bash
sudo apt install speech-dispatcher-rhvoice rhvoice-english
```

It then appears in the *Engine* dropdown. Other free options in the Ubuntu
repositories: `speech-dispatcher-pico` (small, clearer than espeak),
`speech-dispatcher-festival`, and `mbrola` plus a voice such as `mbrola-us2`,
which espeak-ng can use for much smoother output. Check what registered with
`spd-say -O`.

**Or skip the browser entirely.** If the game server is running
(`npm run dev` in `backend/`), the app falls back to speaking through your
system's own speech-dispatcher — no flags, works in any browser. The Coach panel
tells you when it is using this route. **Firefox also needs no flag.**

Other things worth checking:

- **The `🔊 Voice on` button** in the Coach panel header. It is on by default,
  but saved settings from an earlier build win — click it on.
- **Chrome will not speak until the page has had a click.** Pressing *Speak* once
  satisfies that.
- **Is the system stack working at all?** `spd-say "test"` should speak, and
  `spd-say -O` should list an output module such as `espeak-ng`. If not:
  ```bash
  sudo apt install speech-dispatcher speech-dispatcher-espeak-ng
  ```

To see what your browser actually has, run `speechSynthesis.getVoices().length`
in its console. If it returns `0`, no app-side change can produce sound.

### Exporting games

Every game can be saved as a `.pgn` file for later:

- **Analyze → Download PGN** exports the loaded game *with the engine's verdicts
  folded in as move comments* — `Nf6 {blunder ?? | M1 | allows forced mate}` —
  which Lichess, SCID and ChessBase all preserve.
- **Play the engine / Play a friend → Download PGN** saves the game you just
  played.
- Each entry in *Your games* has its own download link.

### Where your data lives

There is no database. Games and settings are kept in `localStorage` under the key
`chess-trainer:v1`, so they survive a refresh but never leave the machine. The
library keeps the 50 most recent games. Clearing site data clears everything.

---

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
