(() => {
  const $ = (id) => document.getElementById(id);

  // Safe localStorage access helpers
  function safeGetItem(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (e) {
      console.warn('localStorage access blocked for key:', key, e);
      return defaultValue;
    }
  }

  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('localStorage access blocked for key:', key, e);
      return false;
    }
  }

  const connEl = $('conn');
  const phasePill = $('phase-pill');
  const nameInput = $('name');
  const lobbyError = $('lobby-error');
  const buzzer = $('buzzer');
  const buzzerWrap = $('buzzer-wrap');
  const buzzerKicker = document.querySelector('.buzzer-kicker');
  const buzzerLabel = $('buzzer-label');
  const speakToggle = $('speak');
  const voiceSelect = $('voice');
  const promptInput = $('prompt');

  let role = null;
  let name = '';
  let myId = null;
  let ws = null;
  let state = null;
  let lastReject = '';
  let retryMs = 1000;
  let audioCtx = null;

  const phaseCopy = {
    idle: 'Buzzers closed',
    armed: 'Buzzers live',
    locked: 'Round locked',
  };

  const rejectCopy = {
    closed: 'Buzzers are closed',
    locked: 'Too late',
    already: 'Already locked in',
  };

  nameInput.value = safeGetItem('trotters-name') || '';
  $('origin').textContent = location.origin;
  speakToggle.checked = safeGetItem('trotters-speak') !== 'off';

  function show(view) {
    for (const id of ['lobby', 'player', 'host']) {
      $(`view-${id}`).hidden = id !== view;
    }
    phasePill.hidden = view === 'lobby';
  }

  function setConnected(online) {
    connEl.dataset.on = online ? 'true' : 'false';
    connEl.textContent = online ? 'Live' : 'Offline';
  }

  function send(message) {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
  }

  function preferredVoice(voices) {
    const saved = safeGetItem('trotters-voice');
    if (saved) {
      const chosen = voices.find((voice) => voice.name === saved);
      if (chosen) return chosen;
    }
    const score = (voice) => {
      const label = `${voice.name} ${voice.lang}`.toLowerCase();
      if (label.includes('andrew')) return 0;
      if (label.includes('natural') && label.includes('united kingdom')) return 1;
      if (label.includes('natural') && label.includes('en')) return 2;
      if (voice.lang.toLowerCase().startsWith('en-gb')) return 3;
      if (voice.lang.toLowerCase().startsWith('en')) return 4;
      return 5;
    };
    return [...voices].sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name))[0] || null;
  }

  function loadVoices() {
    if (!window.speechSynthesis) return;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;
    const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
    const list = english.length ? english : voices;
    const previous = voiceSelect.value;
    voiceSelect.replaceChildren();
    for (const voice of list) {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    }
    const pick = list.find((voice) => voice.name === previous) || preferredVoice(list);
    if (pick) voiceSelect.value = pick.name;
  }

  function speak(text) {
    if (!window.speechSynthesis || !text) return;
    const utter = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const selected = voices.find((voice) => voice.name === voiceSelect.value) || preferredVoice(voices);
    if (selected) {
      utter.voice = selected;
      utter.lang = selected.lang;
    }
    utter.rate = 1;
    utter.pitch = 1;
    speechSynthesis.cancel();
    window.setTimeout(() => speechSynthesis.speak(utter), 50);
  }

  function buzzSound(ok) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = ok ? 196 : 110;
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.22);
    osc.frequency.exponentialRampToValueAtTime(ok ? 520 : 70, audioCtx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.24);
    if (navigator.vibrate) navigator.vibrate(ok ? [30, 40, 80] : 50);
  }

  function rosterItem(player, winner) {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.className = 'person';
    label.textContent = player.name;
    li.appendChild(label);
    if (winner && winner.id === player.id) {
      li.classList.add('is-winner');
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = 'First';
      li.appendChild(badge);
    }
    return li;
  }

  function fillRoster(listEl, players, winner) {
    listEl.replaceChildren(...players.map((player) => rosterItem(player, winner)));
  }

  function render() {
    if (!state) return;
    const winner = state.buzzOrder[0] || null;
    phasePill.hidden = !role;
    phasePill.dataset.phase = state.phase;
    phasePill.textContent = state.phase === 'armed' ? 'Live' : state.phase === 'locked' ? 'Locked' : 'Closed';

    const roundLabel = state.round ? `Round ${state.round}` : 'Ready';
    $('round-player').textContent = roundLabel;
    $('round-host').textContent = roundLabel;
    $('player-prompt').textContent = state.prompt || 'Waiting for the next question.';
    $('no-host').hidden = state.hostOnline || role !== 'player';

    if (document.activeElement !== promptInput && promptInput.value !== state.prompt) {
      promptInput.value = state.prompt;
    }

    const winnerCard = $('winner-card');
    winnerCard.hidden = !winner;
    $('winner-name').textContent = winner ? winner.name : '';

    $('host-status').textContent = winner ? `${winner.name} buzzed in` : phaseCopy[state.phase];
    $('arm').disabled = state.phase === 'armed';
    $('lock').disabled = state.phase !== 'armed';
    $('reset').disabled = state.phase === 'idle' && state.buzzOrder.length === 0;

    const players = state.players || [];
    fillRoster($('roster'), players, winner);
    fillRoster($('player-roster'), players, winner);
    $('player-count').textContent = String(players.length);
    $('roster-empty').hidden = players.length > 0;

    const mine = winner && winner.id === myId;
    const armed = state.phase === 'armed' && connEl.dataset.on === 'true';
    buzzer.disabled = !armed;
    buzzerWrap.classList.toggle('armed', state.phase === 'armed');
    if (state.phase === 'armed') {
      buzzerKicker.textContent = 'Hit it';
      buzzerLabel.textContent = 'BUZZ';
      $('player-status').textContent = 'Buzzers live';
    } else if (mine) {
      buzzerKicker.textContent = 'Locked';
      buzzerLabel.textContent = 'YOU';
      $('player-status').textContent = 'You buzzed in';
    } else if (state.phase === 'locked') {
      buzzerKicker.textContent = winner ? 'Too late' : 'Closed';
      buzzerLabel.textContent = 'LOCK';
      $('player-status').textContent = winner ? `${winner.name} got there first` : 'Buzzers locked';
    } else {
      buzzerKicker.textContent = 'Stand by';
      buzzerLabel.textContent = 'WAIT';
      $('player-status').textContent = 'Wait for the host';
    }

    const rejectEl = $('player-reject');
    if (lastReject && state.phase !== 'locked') {
      rejectEl.hidden = false;
      rejectEl.textContent = rejectCopy[lastReject] || 'Not this time';
    } else {
      rejectEl.hidden = true;
      rejectEl.textContent = '';
    }

    if (role === 'host') {
      document.title = state.phase === 'armed'
        ? 'LIVE · Trotters'
        : 'Host · Trotters Independent Traders';
    } else if (role === 'player') {
      document.title = 'Buzzer · Trotters';
    }
  }

  function join(nextRole) {
    const trimmed = nameInput.value.trim();
    if (nextRole === 'player' && !trimmed) {
      lobbyError.hidden = false;
      lobbyError.textContent = 'Enter a name so the host can see who buzzed.';
      nameInput.focus();
      return;
    }
    lobbyError.hidden = true;
    name = trimmed || 'Host';
    role = nextRole;
    safeSetItem('trotters-name', name);
    show(nextRole);
    send({ type: 'join', role, name });
    render();
  }

  function publishPrompt() {
    send({ type: 'prompt', text: promptInput.value });
  }

  function pressBuzzer() {
    if (!role || role !== 'player' || buzzer.disabled) return;
    buzzer.disabled = true;
    send({ type: 'buzz' });
  }

  $('lobby-form').addEventListener('submit', (event) => {
    event.preventDefault();
    join('player');
  });

  $('join-host').addEventListener('click', () => join('host'));
  buzzer.addEventListener('click', pressBuzzer);
  $('publish').addEventListener('click', publishPrompt);
  $('read').addEventListener('click', () => {
    publishPrompt();
    const line = promptInput.value.trim();
    if (line) speak(line);
  });
  $('arm').addEventListener('click', () => send({ type: 'arm' }));
  $('lock').addEventListener('click', () => send({ type: 'lock' }));
  $('reset').addEventListener('click', () => send({ type: 'reset' }));
  $('test-voice').addEventListener('click', () => {
    speak('Trotters Independent Traders. Buzzers ready.');
  });

  speakToggle.addEventListener('change', () => {
    safeSetItem('trotters-speak', speakToggle.checked ? 'on' : 'off');
  });

  voiceSelect.addEventListener('change', () => {
    if (voiceSelect.value) safeSetItem('trotters-voice', voiceSelect.value);
  });

  document.addEventListener('keydown', (event) => {
    if (event.code !== 'Space' || role !== 'player') return;
    if (event.target.matches('input, textarea, select, button')) return;
    event.preventDefault();
    pressBuzzer();
  });

  function handleMessage(message) {
    if (message.type === 'hello') {
      myId = message.id;
      render();
      return;
    }
    if (message.type === 'state') {
      const previousPhase = state && state.phase;
      state = message.state;
      if (state.phase !== previousPhase) lastReject = '';
      render();
      return;
    }
    if (message.type === 'buzz-result') {
      buzzSound(message.ok);
      if (!message.ok) {
        lastReject = message.reason || 'closed';
        render();
      }
      return;
    }
    if (message.type === 'narrate' && role === 'host' && speakToggle.checked) {
      speak(message.text);
    }
  }

  function connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${proto}://${location.host}`);
    ws.addEventListener('open', () => {
      retryMs = 1000;
      setConnected(true);
      if (role) send({ type: 'join', role, name });
    });
    ws.addEventListener('message', (event) => {
      try {
        handleMessage(JSON.parse(event.data));
      } catch {
        /* ignore malformed frames */
      }
    });
    ws.addEventListener('close', () => {
      setConnected(false);
      buzzer.disabled = true;
      window.setTimeout(connect, retryMs);
      retryMs = Math.min(retryMs * 1.6, 8000);
    });
  }

  if (window.speechSynthesis) {
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
  } else {
    voiceSelect.replaceChildren(new Option('Speech synthesis is unavailable on this device', ''));
    $('test-voice').disabled = true;
    $('read').disabled = true;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  connect();
})();
