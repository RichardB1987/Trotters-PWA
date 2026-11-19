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
server.js              Express server: static files + /proxy-stream
public/
  index.html           Main portal (Trotters Portal)
  game-hub.html        Game Hub menu
  music.html           Music Hub menu
  radio.html           Live radio stations
  buzzer.html          Buzzer Arena (player role selection + buzzer)
  client.js            Buzzer client logic
  heads-up.html        Heads Up! game
  games/
    gibberish-host.html    Gibberish Party host screen
    gibberish-judge.html   Gibberish Party judge controller
    gibberish-cards.json   Gibberish Party card data
    hitster/
      hitster.html         Hitster (music card game)
      hitster-bingo.html   Hitster Bingo
      js/tracks.js         Track seeds grouped by decade
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
| Heads Up!    | `heads-up.html`                        | Category-based guessing game with round timer    |
| Gibberish Party | `games/gibberish-host.html`         | Host screen plus judge controller on a phone     |
| Music Hub    | `music.html`                           | Links to live radio and jukebox                  |
| Live Radio   | `radio.html`                           | Streams radio stations                           |

## Server endpoints

- `GET /` serves `public/index.html`.
- Everything in `public/` is served statically.
- `GET /proxy-stream?url=<encoded-stream-url>` proxies an audio stream (follows
  redirects and sets permissive CORS headers). Used by the radio player.

## Known gaps

These were found while writing this README and are not yet implemented in the
repo:

- **Buzzer Arena needs a realtime backend.** `buzzer.html` expects a Socket.IO
  server (`set-role`, `player-buzz`, `state-update`, `lockout-triggered`) and
  `client.js` expects a plain WebSocket on the same host. `server.js` currently
  has neither, even though `socket.io` and `ws` are in `package.json`.
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
