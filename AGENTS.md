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
- 2026-11-26: Phone buzzer tidy-up (`public/dumb-dumber-buzzer.html` only; `sw.js`, `manifest.json`, `server.js`, `dumb-dumber-dumbest.html`, `game-hub.html` and every other page untouched). The "Buzzer sound" and "Your colour" pickers now sit behind one compact pill toggle (`#settingsToggle`) that shows the current choice as a colour dot + "Horn · Lime" and flips its caret; the panel (`#settingsPanel`, `hidden` by default) opens/closes from that button and also closes on Escape. All 7 `SOUNDS` (still previewing on select) and all 8 `COLOURS` and both `localStorage` keys (`dumbDumberBuzzerSound`, `dumbDumberBuzzerColour`) are unchanged; the summary text is refreshed by the new `renderSummary()` whenever the sound or colour changes. While the panel is open, `body.settings-open` shrinks the buzz button (`min(66vw, 26vh, 300px)`), keeps a minimum stage height and lets `#app` scroll, so nothing is cut off on short phones; with the panel closed the screen is just the big BUZZ button.
- 2026-11-26: Dumb Dumber Dumbest audio (only `public/dumb-dumber-dumbest.html` and `public/dumb-dumber-buzzer.html` touched). (1) Host page plays `/sounds/times-up-sound.mp3` when the round timer reaches zero (`playTimeUp()` in `timeUp()`), at `volume = 0.5` so it sits under the full-volume spoken questions/answers; the new `stopTimeUp()` runs at the top of `resetTimer()`, which covers advancing to the next question (`revealQuestion`), starting a new round (`resetRound`/`playAgain` -> `cancelRound`) and returning to the lobby / winner overlay (`toLobby`/`showWinner` -> `cancelRound`). (2) Phone buzzer gains 4 new sound options (Beverley, Kate, Norrie, Richard) each with `file: '/sounds/<name>-buzzer.mp3'` and a synth fallback; persistence through `dumbDumberBuzzerSound` and the colour picker / `dumbDumberBuzzerColour` are unchanged. `.opts` now wraps (`flex-wrap: wrap`, `.opt { flex: 1 1 4.2rem }`) so 7 buttons fit a phone row. `speechToken`, scoring, ladder/token placement and layout logic untouched; `sw.js`, `manifest.json`, `server.js`, `game-hub.html` and every other game untouched (bump `CACHE` in `sw.js` if phones show the old buzzer page).
- 2026-11-26: Three Dumb Dumber Dumbest tweaks (only `public/dumb-dumber-dumbest.html` and `public/dumb-dumber-buzzer.html` touched; `sw.js`, `manifest.json`, `server.js`, `game-hub.html` and every other game untouched). (1) **No stray host scrollbar on desktop:** on `min-width: 901px` a `body.playing` class (added/removed by the new `fitBoard()`, also called on resize and when a game starts) makes `#game` a viewport-filling flex column and sets the ladder's `--rowH` to the height actually left over, so the whole host screen fits one page; the 10 rungs stay within 30-80px and a very short viewport (under 260px of ladder space) or a narrow (<900px) one falls back to the old scrolling layout. Scoring, speech, timer, winner and Back buttons unchanged. (2) **Buzzer colour picker:** `dumb-dumber-buzzer.html` gained an 8-swatch "Your colour" panel using the same colours as `PLAYERS` on the host page; `buzzArt(col)` recolours the scalloped token ring, the buzz button gets a matching glow, the panel label and the "LIME BUZZED!" message name the colour, and the choice persists in `localStorage` (`dumbDumberBuzzerColour`). Sound picker untouched; buzz button cap reduced 52vh -> 36vh to make room on phones. (3) **Next Question now does the whole job:** from the answered state, **Next Question** reveals and speaks the next question and starts the 6-second timer in one tap (the `answered` phase now calls `revealQuestion()`, which first does `stopSpeech(); resetTimer()`); the separate "Reveal Question" tap is only needed for the first question of a game.
- 2026-11-26: Restyled the **Dumb Dumber Dumbest** host IQ ladder (`public/dumb-dumber-dumbest.html` only) to match the red reference scoreboard card: speckled red (`#e53925`/`#df321f`) card with a scalloped white inner trim and gold 4-point sparkles on the row dividers; each rung is now 3 parts (cream `#01`-`#10` badge, big white outlined comic number with a small `iQ`, white rounded brain card). Brain faces run clever to clueless (200 Einstein hair, 180 glasses, 160 smug, 130 shocked, 100 grin, 80 content, 60 flat, 40 wandering eyes, 20 swirly woozy, 0 half-lidded blank with drool; still one face per rung in `FACES`). CSS-only animations per tier (`.t0-.t2` crisp pop + twinkle, `.t3-.t5` lively bob, `.t6-.t9` slow dazed wobble that gets bigger lower down; disabled under `prefers-reduced-motion`). Ladder column widened to `minmax(340px, 33%)`; QUESTION card min-height reduced (2.4 rows) and ANSWER card increased (2.8 rows). Player tokens on the ladder now sit between the IQ text and the brain card (`updateLadder()` only). Scoring, speech, timer, winner and all "Back to Games Hub" links untouched; `sw.js` and `manifest.json` untouched (bump `CACHE` if phones show the old look).
- 2026-11-26: Added **Dumb Dumber Dumbest** (retro cream/burnt-orange sunburst, scalloped frame, pink cartoon brains; all art is inline SVG, no CDNs/fonts/images): `public/dumb-dumber-dumbest.html` (lobby with 8 ring-colour tongue-out brain tokens in 12-lobed rings, pick 2-5; "Phone Buzzer QR" brain button opens a modal with a QR generated by a small inline encoder, no external API; host screen with IQ ladder left (rungs 200/180/160/130/100/80/60/40/20/0, tokens sit on the highest rung <= score, scores clamp 0-200 in steps of 10), 6-second circular timer in the centre gap, QUESTION/ANSWER cards right, big player tokens along the bottom where the top half is +10 and the bottom half is -10; Reveal Question -> 2s wait -> `speechSynthesis` (Microsoft Ryan, then en-GB, then any English) -> timer starts on `onend` (safety timeout if speech never ends) -> Reveal Answer cancels speech and speaks the answer; Back to Games Hub link on lobby, game screen and winner overlay; winner overlay at 200 or Finish Game with titles by player count: 2 = Einstein/Dumbest, 3 = Einstein/Dumb/Dumbest, 4 = Einstein/Dumb/Dumber/Dumbest, 5 = Einstein/Dumb/Dumber/Dumbest/Thicko, ties share the better title; Play Again keeps players), `public/dumb-dumber-buzzer.html` (standalone phone buzzer, no server; Horn/Chime/Buzz Web Audio tones remembered in `localStorage`; each entry in the `SOUNDS` array has a `file` field to swap in an MP3 later) and `public/dumb-dumber-questions.json` (12 sample `{question, answer}` objects, shuffled without repeats, reshuffles when used up). One new `.dumb-card` tile added after UNO Spin in `game-hub.html`. `index.html`, `sw.js`, `manifest.json`, `server.js` and all other tiles/games untouched. Buzzer URL falls back to `192.168.0.242:3000` when the host is opened via `localhost`.
- 2026-11-25: Restyled **only** the Hitster tile in `game-hub.html` (new `.hitster-card` class on that one tile, no other tile touched) from the Hitster wordmark + retail box artwork: deep black base with a purple→cyan→lime gradient border along the side edges and a cyan neon frame glow, a magenta/cyan/yellow/orange broken-arc motif in the top-right corner, a cropped silver speaker cone (mounting ring + dark dust cap) in the bottom-right, a new circular cyan-ringed speaker emblem SVG (silver cone, four mounting screws, dark dust cap, broken neon arcs behind), a neon-tube magenta uppercase "HITSTER" wordmark (`-webkit-text-stroke` + pink glow) and a cyan/lime-neon-bordered "Play Hitster" footer pill that brightens on hover; a ≤420px rule keeps the tile legible at 390px. Colour values are taken from the artwork itself (the game page uses a softer neon set). `href`, the title/description text, the footer wording, grid layout and every other tile untouched; no CDN, `sw.js` or `manifest.json` changes.
- 2026-11-25: Restyled **only** the Hitster Bingo tile in `game-hub.html` (new `.hitster-bingo-card` class on that one tile, no other tile touched) to match `games/hitster/hitster-bingo.html`'s club look: deep purple→black room with a disco-ball burst glow (top-right) and faint speaker-cone shapes down both edges, subtle concentric vinyl/record grooves behind the copy, a tilted cyan/pink dancefloor tile grid along the bottom edge, a neon pink→purple→cyan→green→yellow header strip, a gold-ringed disc emblem holding a new concentric broken-arc record SVG, multi-colour neon "HITSTER BINGO" lettering (gradient `background-clip: text` with pink+cyan glow, plain yellow fallback) and a neon-gradient-bordered "Play Hitster Bingo" footer pill that brightens on hover. Colour values are copied locally from that page's `:root` (hub links no shared stylesheet). `href`, the title/description text, the footer wording, grid layout and every other tile untouched; `sw.js` and `manifest.json` untouched.

- 2026-11-25: Restyled **only** the Quiz Bingo tile in `game-hub.html` (new `.quiz-bingo-card` class on that one tile, no other tile touched) to match its own wheel screen: dark stout board with a warm amber sunburst + marquee glow and fizzy bubble dots, a five-slice wheel strip (red/teal/green/pink/blue) along the top edge, a bulb-ringed emblem holding a new 5-slice wheel SVG, a lamp-yellow Bungee/Impact "QUIZ BINGO" title with a hard ink shadow, cream body copy, and a chunky lamp "Play Quiz Bingo" footer pill that turns wheel-red on hover. Colour values are copied locally from `quiz-bingo-theme.css` (the hub links no shared stylesheet, and linking it would repaint the whole page). `href`, card copy, grid layout and every other tile (incl. Herd Mentality and UNO Spin) untouched; no "Pub Quiz"/"1440 Questions" text added; `sw.js` and `manifest.json` untouched.
- 2026-11-25: Restyled **only** the Herd Mentality tile in `game-hub.html` (new `.herd-card` class on that one tile, no other tile touched): teal→green pasture background with grass tufts and a green hill, pink strip along the top edge, white picket fence across the bottom edge, the game's own cow-head avatar SVG in a mint circle (horns/ears visible), a "HERD" white-outlined + "MENTALITY" pink-pill title, dark ink body copy for contrast on green, and a chunky pink "Play Herd Mentality" footer pill that turns yellow on hover. Grid layout, `href`, card copy, UNO Spin and every other tile, `sw.js` and `manifest.json` untouched.
- 2026-11-25: Herd Mentality phone page (`games/herd-mentality/phone-answer.html`): made the answer `<textarea>` compact (fixed `height: 6.5rem`, ~3 lines, scrolls internally) instead of stretching to a tall empty box, and let `.card` hug its content (`flex: 0 0 auto`, padding `0.9rem`, gap `0.6rem`) so the header, answer input, Show Answer, Clear and the bottom caption all fit on a phone with no cut-off. The reveal view (`.show-view`/`.show-text`/`.show-text-inner`/`.show-actions`) and the `fitShowText()` sizing logic are untouched.
- 2026-11-25: Added Herd Mentality (inspired by the board game; all cows are custom inline SVG, no image files): `games/herd-mentality/herd-mentality.html` (host screen: setup with 2-8 players, names, 8 unique cow-head avatars via fill colour + accessory, compact QR; game screen with pasture, picket-fence pen holding only the Pink Cow, question card tap-to-advance with ‹ step-back, up to 4 players per side, full-body score cows where tapping the top half is +1 and the bottom half is -1 floored at 0, Undo history, QR modal, rules modal), `questions.json` (80 prompts: `id`, `category`, `question`) and `phone-answer.html` (standalone phone page: type an answer, show it full-screen, clear for next round; no server sync, uses localStorage only). Pink Cow is dragged (pointer events) or tap-then-tap onto a player; a holder with 8+ points sees "pass the Pink Cow to win" and only wins once it is passed. Scoring (including the rule that tied biggest groups all get +1) is applied manually by the host via the score cows. QR uses the same CDN `qrcodejs` and `192.168.0.242:3000` fallback as the other games. One new tile added to `game-hub.html`. `server.js`, `sw.js`, `manifest.json`, `README.md` and all other games untouched.
- 2026-11-25: Quiz Bingo wheel bulbs are now real elements so they can flash out of phase. The dotted `border: 7px dotted var(--lamp)` on `.wheel-container::before` was replaced with a `.wheel-bulbs` layer plus 20 `<span class="bulb">` (built once by a new `buildBulbs()` in `quiz-bingo.html`). Each bulb is a full-size rotated wrapper with a `.bulb::before` dot, reusing the existing `.wheel-label` rotate trick so it scales at any width. Disc and bulbs share the same `inset: -14px` box, so they stay aligned and the ring sits behind the wheel (both `z-index: -1`; the wheel face is never covered). A styling-only `is-spinning` class on `.wheel-container`, toggled in `setStage()` when `stage === STAGE.SPINNING`, switches on a `bulbFlash` keyframe whose per-bulb `--i` negative `animation-delay` makes the glow chase round the ring; it stops when the stage leaves `SPINNING` (spin and respin both funnel through `startSpin` -> `setStage`). No changes to IDs, `data-*`, `currentRotation`, the `rotate()` transform, `WHEEL_SPIN_MS`, landing maths, speech, modifiers or audio (this page has none). `quiz-bingo-theme.css`, `bingo-card.html`, `sw.js` and `manifest.json` untouched.
- 2026-11-25: Restyled Quiz Bingo as "Marquee Lights" pub-quiz (amber sunburst + bubble backdrop, Bungee + Nunito fonts, thick `--ink` outlines with hard offset shadows, cream game-card with category colour header strip and gold answer ribbon). New shared `games/quiz-bingo/quiz-bingo-theme.css` holds `--cat-1..5` category tokens, ink/surface/font tokens and the `.t-*` tile colours; both `quiz-bingo.html` and `bingo-card.html` link it, so wheel and tiles cannot drift. Tile class names (`t-blue` etc.) kept because phones save them in localStorage. JS touched only in `quiz-bingo.html`: `WHEEL_COLORS` now uses `var(--cat-N)`, plus a styling-only `--active-cat` variable set in `landOnCategory` and cleared in `resetBoard`. Game logic, ids and handlers unchanged. If phones show the old look, bump `CACHE` in `sw.js`.
- 2026-11-24: Added Quiz Bingo: `games/quiz-bingo/quiz-bingo.html` (Hitster-Bingo-style host screen with a category wheel built from `questions.json` keys, unused-question tracking, 5-stage button lockout Idle → Spinning → Category landed → Question revealed → Answer revealed, en-GB `speechSynthesis`, Phone Cards QR modal) and `games/quiz-bingo/bingo-card.html` (standalone 5×5 coloured card with guess box, Clear Text, New Card). One new card on `game-hub.html`. `hitster/` and `index.html` untouched.
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
