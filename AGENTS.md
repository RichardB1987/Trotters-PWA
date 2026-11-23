# AGENTS.md

Instructions for any AI assistant (Cursor, Gemini, Claude, etc.) working on this repo.
Read this fully before changing anything.

## What this project is

"Trotters Independent Traders": a party-game PWA for family game nights (Christmas).
Run on a laptop/TV, with phones/tablets joining over the same Wi-Fi.
It is a hobby project by a non-programmer who builds it by describing changes in plain English.
Keep things simple. Do not add frameworks, build tools, TypeScript, or databases.

## How to run

```
npm install
npm start        # http://localhost:3000
```

Node 18+. Dependencies: express and socket.io (used), ws (installed, not used). `Trotters Portal.bat` is a Windows launcher (Edge full-screen, hard-coded LAN IP `192.168.0.242`); the project owner runs it on Windows.

## How the code is laid out

- `server.js`: Express + Socket.IO server. Serves `public/`, has a proxy route `/proxy-stream` (used by radio), and Socket.IO events for the Countdown buzzers (`join-game`, `buzz` -> `player-joined`, `buzzed`).
- `public/`: everything the browser loads. **Plain HTML/CSS/JS, no build step.**
- Each page is a **single self-contained HTML file** with its own `<style>` and `<script>` inline.
  There is no shared stylesheet in use, and each page defines its own colour variables.
  Exception: the Countdown pages use `public/style.css`, so changing that file affects them.
- Pages and what they are:
  - `index.html`: main portal (links to Lights, Music, Sounds, Game Hub)
  - `game-hub.html`: menu of games
  - `buzzer.html` + `client.js`: buzzer system
  - `heads-up.html`: Heads Up! game
  - `games/hitster/hitster.html`, `hitster-bingo.html`, `js/tracks.js` (song list by decade)
  - `games/countdown/`: Countdown game (`countdown.html` host, `countdown.js`, phone buzzer `countdown-buzzer.html` + `buzzer.js`; this one uses the shared `style.css`)
  - `games/gibberish-host.html`, `gibberish-judge.html`, `gibberish-cards.json`
  - `music.html`, `radio.html`: music hub and live radio
- `sw.js`: service worker for offline support. `manifest.json`: PWA install info.

## Rules for making changes (important)

Past AI edits have broken unrelated things and forgotten earlier decisions. To avoid that:

1. **Make the smallest change that does the job.** Edit only the file(s) needed.
   Never rewrite or "clean up" a whole file unless explicitly asked.
2. **Do not touch other games/pages** than the one being discussed.
3. **Never delete or rename existing features, buttons, files or IDs** without asking first.
   Other pages and scripts reference element IDs and file paths by name.
4. **If a request is vague or large, ask 2 to 3 short questions first** before writing code
   (what should it look like, what should happen on mistakes, which page).
5. **Before editing, say in one or two sentences what you plan to change.** After, list the files you changed.
6. **Keep the existing style** of the file you are editing (naming, layout, colours). Do not introduce new libraries or CDNs without asking.
7. **If you change a file path, filename or add a page, update every link to it** and the links in the "Back" buttons (see below).
8. **Do not change `sw.js` caching or `manifest.json`** unless asked. If a change doesn't show up on a phone, the service worker cache is a likely cause: bump `CACHE` in `sw.js` (e.g. `trotters-shell-v2`).
9. **Update the "Status and decisions" section at the bottom of this file** whenever you finish a change, finish a feature, or the user makes a decision. This is how the project remembers things between sessions.

## Editing files and running commands

- Prefer the agent's built-in file-editing tools for source edits. In Cline, use the native edit tool for targeted changes and the native write tool for new files. Review the diff after editing.
- Use PowerShell for tasks that need a terminal, such as running `npm install`, starting the app with `npm start`, checking JavaScript with `node --check server.js`, or inspecting changes with `git diff`. Run test or build commands when the project provides them.
- If the built-in tools cannot make a needed edit, explain why a shell command is needed and what files it will change. Follow the normal command approval flow.

## Conventions to keep

- Every game page has a way back: games link to `/game-hub.html` ("Back to Games Hub"), the hub links to `index.html`, radio links to `music.html`, music links to `index.html`. Keep this chain intact.
- Dark theme, mobile-friendly layouts (phones are the main controllers). Test at phone width.
- Plain `fetch` / DOM APIs; no jQuery or React.
- Sounds live in `public/sounds/`. Reference with relative or root paths that actually exist.
- Hitster songs are data in `games/hitster/js/tracks.js`. Add songs there, do not hard-code them in the HTML.

## Testing a change

1. `npm start`, open http://localhost:3000.
2. Click through the page you changed **and** the pages that link to it.
3. Check the browser console for red errors.
4. Test on a phone at `http://<laptop-LAN-IP>:3000` if the change affects layout or touch.

## Status and decisions

_Keep this section current. Newest first. One short line per item._

### Known broken / unfinished
- **Buzzer Arena doesn't work.** `buzzer.html` expects Socket.IO events `set-role`, `player-buzz`, `state-update`, `lockout-triggered` and `client.js` expects a plain WebSocket. `server.js` only handles the Countdown events (`join-game`, `buzz`).
- **Countdown phone buzzer is work in progress.** QR code only shows on round 13 and uses the page's own address, so the host page must be opened via the LAN IP, not `localhost`.
- **Missing pages that are linked:** `lights.html`, `sounds.html` (from `index.html`), `jukebox.html` (from `music.html`).
- Gibberish Party uses PeerJS (public cloud broker), so it needs internet.
- Nav "Back" links are inconsistent between pages (different class names and styles).

### Decisions made
- No frameworks or build tools. Plain HTML/JS, one file per page.
- Target use: family party games at Christmas, same Wi-Fi network.

### Changelog
- 2026-11-22: Configured Gibberish Host pre-game setup to start with no players pre-selected on initial launch and cleanly label tapped icons in turn order (1st tap = Player 1, 2nd tap = Player 2, etc.) with matching order badges; aligned active screen split proportions with Hitster Bingo (max-width 1200px, 1fr 1fr balanced layout, circular tokens with score values beside them); synced countdown timer and active player scoreboard in real time with judge controller events.
- 2026-11-22: Updated Gibberish Host active game screen to a balanced 1:1 two-column split with max-width 1100px for generous scoreboard readability across 15.6" screens; styled scoreboard entries to match circular token aesthetics (highlighted circle icon with order badge, player name, and large score display) while removing + Player, Reset, and manual +/- buttons; added score state clearing to 0 when exiting to Game Hub.
- 2026-11-22: Redesigned Gibberish Host setup tokens into round circular buttons with clear order badges and labels; introduced two-column split layout for active game screen (phrase & controls left, scoreboard & Up Next banner right) without vertical scrolling on 15.6" screens; automated turn rotation to advance active player across rounds and update gibberish_active_player cleanly.
- 2026-11-22: Added compact 8-icon tap-order selector on Gibberish Host pre-game screen (1st tap = active, badges 1-8, toggle/clear, no scrolling on 15.6" screen).
- 2026-11-22: Connected Gibberish Host player scoreboard selection and scoring logic cleanly with active player toggle and event propagation guards.
- 2026-11-22: Fixed Gibberish Host game card width consistency and layout thrashing between setup and active game screens.
- 2026-11-21: Documented when to use native file-editing tools and PowerShell.
- 2026-11-19: Added 53 Gibberish cards to `public/games/gibberish-cards.json` (British-accent phonetic style; 38 original, 15 transcribed from the commercial Encrypted/Mad Gab example cards). New categories: Christmas, TV & Film, Food & Drink, Places, Songs, Kids, Grown-Ups, Everyday Phrases. Richard's original 30 cards (Movies, Music Lyrics, Everyday Phrases) were later removed (see below).
- 2026-11-19: Added 14 more Gibberish cards from a public Mad Gab list (new category: General Knowledge). Total now 97.
- 2026-11-19: Added 7 more Gibberish cards (Go in peace, Don't do drugs, etc.). Total now 104.
- 2026-11-20: Removed Richard's original 30 Gibberish cards (the weak "Movies", "Music Lyrics" and "Everyday Phrases" set, e.g. "The God Father") at Kate's request. 74 cards remain.
- Gibberish card method: write the answer as British (non-rhotic) syllables, regroup into different words so no original word survives, give a specific short hint, then test blind (someone who only sees the gibberish tries to decode it).
- 2026-11-19: Added README.md and AGENTS.md; updated both for the new Countdown game, Socket.IO in `server.js`, and the Windows launcher.
- 2026-11-19: (Richard) Added Countdown game, Socket.IO server, `wheel-spin-hitster.mp3`, `Trotters Portal.bat`.
