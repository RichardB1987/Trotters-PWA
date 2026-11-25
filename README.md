# Trotters Independent Traders

An offline-first Progressive Web App (PWA): a party / game-night portal with a
games hub, music games, live radio and a game show buzzer system. It is served
by a small Express server and is designed to be opened on a laptop or TV plus
phones/tablets on the same Wi-Fi network.

## Requirements

- Node.js 18 or newer

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:3000.

To use a different port:

```bash
PORT=4000 npm start
```

### Using it from other devices

Find your computer's LAN IP address and open `http://<LAN-IP>:3000` on phones
or tablets connected to the same network. The app can be installed to the home
screen from the browser (it ships a web manifest and a service worker).

## Project structure

```
server.js              Express + Socket.IO server: static files, /proxy-stream, Countdown buzzer events
Trotters Portal.bat    Windows launcher: opens the portal in Edge full-screen (hard-coded LAN IP)
public/
  index.html           Main portal (Trotters Portal)
  game-hub.html        Game Hub menu
  music.html           Music Hub menu
  radio.html           Live radio stations
  buzzer.html          Buzzer Arena (player role selection + buzzer)
  client.js            Buzzer client logic
  heads-up.html        Heads Up! game
  games/
    countdown/
      countdown.html        Countdown host screen (TV / laptop)
      countdown.js          Countdown game logic
      countdown-buzzer.html Phone buzzer page (opened via QR code)
      buzzer.js             Phone buzzer client (Socket.IO)
    gibberish-host.html    Gibberish Party host screen
    gibberish-judge.html   Gibberish Party judge controller
    gibberish-cards.json   Gibberish Party card data
    hitster/
      hitster.html         Hitster (music card game)
      hitster-bingo.html   Hitster Bingo
      js/tracks.js         Track seeds grouped by decade
    quiz-bingo/
      quiz-bingo.html      Quiz Bingo host screen (category wheel)
      bingo-card.html      Quiz Bingo phone card (5x5 grid)
      questions.json       Quiz Bingo questions grouped by category
      quiz-bingo-theme.css Quiz Bingo shared colours/fonts (wheel + card tiles)
  sounds/              Buzzer sound effects
  manifest.json        PWA manifest
  sw.js                Service worker (offline shell caching)
  icon.svg             App icon
```

## What's in it

| Section      | Page                                   | Description                                      |
| ------------ | -------------------------------------- | ------------------------------------------------ |
| Game Hub     | `game-hub.html`                        | Entry point to all games                         |
| Buzzer Arena | `buzzer.html`                          | Game show buzzers for players and host           |
| Hitster      | `games/hitster/hitster.html`           | Place songs on a timeline by release year        |
| Hitster Bingo| `games/hitster/hitster-bingo.html`     | Bingo variant of Hitster with a spinning wheel   |
| Quiz Bingo   | `games/quiz-bingo/quiz-bingo.html`     | Category wheel quiz with spoken questions and phone bingo cards |
| Countdown    | `games/countdown/countdown.html`       | Letters and word-guessing game show, 4 players, 13 rounds, final Conundrum. Phones buzz in via QR code |
| Heads Up!    | `heads-up.html`                        | Category-based guessing game with round timer    |
| Gibberish Party | `games/gibberish-host.html`         | Host screen plus judge controller on a phone     |
| Music Hub    | `music.html`                           | Links to live radio and jukebox                  |
| Live Radio   | `radio.html`                           | Streams radio stations                           |

## Server endpoints

- `GET /` serves `public/index.html`.
- Everything in `public/` is served statically.
- `GET /proxy-stream?url=<encoded-stream-url>` proxies an audio stream (follows
  redirects and sets permissive CORS headers). Used by the radio player.
- Socket.IO (same port) handles the Countdown phone buzzers: clients send
  `join-game` (player name) and `buzz`; the server broadcasts `player-joined`
  and `buzzed` to everyone in the `game` room.

## Known gaps

These were found while writing this README and are not yet implemented in the
repo:

- **Buzzer Arena still has no matching server code.** `buzzer.html` expects
  Socket.IO events `set-role`, `player-buzz`, `state-update` and
  `lockout-triggered`, and `client.js` expects a plain WebSocket. `server.js`
  now has Socket.IO, but only for the Countdown events above (`join-game`,
  `buzz`). The `ws` package is installed but unused.
- **Countdown phone buzzer is work in progress.** The QR code only shows on
  round 13 and is built from the address the host page was opened with, so open
  the host page via the LAN IP (not `localhost`) or phones cannot reach it.
- **Missing pages.** `index.html` links to `lights.html` and `sounds.html`, and
  `music.html` links to `jukebox.html`. None of these exist yet.
- **Gibberish Party** uses PeerJS (loaded from a public broker) for host/judge
  connections, so it needs an internet connection even though the rest of the
  app is local.
- The service worker precaches only the main shell (`/`, `index.html`,
  `style.css`, `client.js`, `manifest.json`, `icon.svg`); other pages are
  cached as they are visited.

## License

Private project.
