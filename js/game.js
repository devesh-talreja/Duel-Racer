// ── game.js ───────────────────────────────────────────────────
// Core game loop: race state machine, countdown, lap detection, input.

const Game = (() => {

  // ─── State ─────────────────────────────────────────────────
  const State = { IDLE: 0, COUNTDOWN: 1, RACING: 2, FINISHED: 3, PAUSED: 4 };
  let state = State.IDLE;

  let currentLevel = null;
  let currentCar   = null;

  // Car/NPC states
  let player = null;
  let npc    = null;

  // Timing
  let raceStartTime  = 0;
  let raceElapsed    = 0;
  let countdownTimer = 0;
  let countdownPhase = 3;   // 3 → 2 → 1 → GO

  // Lap tracking
  let playerLap    = { finished: false, time: 0, progress: 0, waypointIdx: 0 };
  let npcLap       = { finished: false, time: 0, progress: 0, waypointIdx: 0 };
  let lastTimestamp = 0;

  // RAF handle
  let rafId = null;

  // Input state
  const input = { accel: false, brake: false, left: false, right: false };

  // ─── Callbacks (set by ui.js / main.js) ────────────────────
  let onRaceFinished = null;

  // ─── Start Race ────────────────────────────────────────────
  function startRace(level, car, finishedCb) {
    currentLevel = level;
    currentCar   = car;
    onRaceFinished = finishedCb;

    const wp = level.waypoints;
    const startX = wp[0].x;
    const startY = wp[0].y;
    const startAngle = Math.atan2(wp[1].y - wp[0].y, wp[1].x - wp[0].x);

    // Offset NPC slightly behind player
    const offsetX = Math.cos(startAngle + Math.PI) * 30;
    const offsetY = Math.sin(startAngle + Math.PI) * 30;

    player = Physics.createCarState(startX, startY, startAngle);
    npc    = NPC.createNPCState(startX + offsetX, startY + offsetY, startAngle);

    playerLap = { finished: false, time: 0, progress: 0, waypointIdx: 0 };
    npcLap    = { finished: false, time: 0, progress: 0, waypointIdx: 0 };
    raceElapsed   = 0;
    countdownPhase = 3;
    countdownTimer = 0;
    state = State.COUNTDOWN;
    lastTimestamp = 0;

    Renderer.init(document.getElementById('race-canvas'));

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  // ─── Main Loop ─────────────────────────────────────────────
  function loop(timestamp) {
    if (state === State.IDLE || state === State.FINISHED) return;
    rafId = requestAnimationFrame(loop);

    const dt = Math.min((timestamp - (lastTimestamp || timestamp)) / 1000, 0.05);
    lastTimestamp = timestamp;

    if (state === State.PAUSED) {
      renderFrame(); return;
    }

    if (state === State.COUNTDOWN) {
      countdownTimer += dt;
      if (countdownTimer >= 1.0) {
        countdownTimer = 0;
        countdownPhase--;
        if (countdownPhase < 0) {
          state = State.RACING;
          raceStartTime = timestamp;
          updateCountdownUI('GO');
          setTimeout(() => hideCountdown(), 700);
        } else {
          updateCountdownUI(countdownPhase === 0 ? 'GO' : String(countdownPhase));
        }
      }
      renderFrame(); return;
    }

    // ── RACING ─────────────────────────────────────────────
    raceElapsed = (timestamp - raceStartTime) / 1000;

    // Player physics
    if (!playerLap.finished) {
      Physics.update(player, currentCar, input, dt, currentLevel.id);
      // Track boundary: clamp player to track (basic - keep near waypoints)
      clampToTrack(player, currentLevel.waypoints, currentLevel.trackWidth);
      updateProgress(player, playerLap, currentLevel.waypoints);
      if (playerLap.progress >= 1.0 && !playerLap.finished) {
        playerLap.finished = true;
        playerLap.time = raceElapsed;
        checkRaceEnd(timestamp);
      }
    }

    // NPC
    if (!npcLap.finished) {
      NPC.update(npc, currentLevel.waypoints, currentLevel, dt);
      updateProgress(npc, npcLap, currentLevel.waypoints);
      if (npcLap.progress >= 1.0 && !npcLap.finished) {
        npcLap.finished = true;
        npcLap.time = raceElapsed;
        checkRaceEnd(timestamp);
      }
    }

    updateHUD();
    renderFrame();
  }

  // ─── Progress Tracking ─────────────────────────────────────
  function updateProgress(carState, lapState, waypoints) {
    const wp = waypoints;
    // Find closest waypoint ahead
    let minDist  = Infinity;
    let bestIdx  = lapState.waypointIdx;
    const search = Math.min(8, wp.length);
    for (let i = 0; i < search; i++) {
      const idx = (lapState.waypointIdx + i) % wp.length;
      const w   = wp[idx];
      const dx  = carState.x - w.x;
      const dy  = carState.y - w.y;
      const d   = dx * dx + dy * dy;
      if (d < minDist) { minDist = d; bestIdx = idx; }
    }

    if (Math.sqrt(minDist) < 40) {
      const prev = lapState.waypointIdx;
      if (bestIdx !== prev) lapState.waypointIdx = bestIdx;
    }

    lapState.progress = lapState.waypointIdx / wp.length;
    // Detect finish (crossed past last waypoint back to 0)
    if (lapState.waypointIdx === wp.length - 1) {
      const lastWP  = wp[wp.length - 1];
      const firstWP = wp[0];
      const dx = carState.x - firstWP.x;
      const dy = carState.y - firstWP.y;
      if (Math.sqrt(dx * dx + dy * dy) < 50) {
        lapState.progress = 1.0;
      }
    }
  }

  // ─── Boundary Clamp ────────────────────────────────────────
  function clampToTrack(carState, waypoints, trackWidth) {
    // Find nearest waypoint
    let minDist = Infinity, nearX = carState.x, nearY = carState.y;
    for (const wp of waypoints) {
      const dx = carState.x - wp.x;
      const dy = carState.y - wp.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) { minDist = d; nearX = wp.x; nearY = wp.y; }
    }
    const limit = trackWidth / 2 + 2;
    if (minDist > limit) {
      // Push back toward track center
      const dx = nearX - carState.x;
      const dy = nearY - carState.y;
      const mag = Math.sqrt(dx * dx + dy * dy);
      const over = minDist - limit;
      carState.x += (dx / mag) * over * 0.8;
      carState.y += (dy / mag) * over * 0.8;
      carState.speed *= 0.7; // collision penalty
    }
  }

  // ─── Race End ──────────────────────────────────────────────
  function checkRaceEnd(timestamp) {
    if (!playerLap.finished && !npcLap.finished) return;
    // Give 1.5s for the other to finish if not yet
    if (playerLap.finished && !npcLap.finished) {
      // NPC hasn't finished, but give it time (up to 5 extra seconds) or fire now
      setTimeout(() => fireFinished(), 100);
      return;
    }
    if (npcLap.finished && !playerLap.finished) {
      setTimeout(() => fireFinished(), 100);
      return;
    }
    fireFinished();
  }

  function fireFinished() {
    if (state === State.FINISHED) return;
    state = State.FINISHED;
    cancelAnimationFrame(rafId);
    if (onRaceFinished) onRaceFinished({ playerTime: playerLap.time, npcTime: npcLap.time, playerFinished: playerLap.finished });
  }

  // ─── Pause / Resume ────────────────────────────────────────
  function pause() {
    if (state !== State.RACING) return;
    state = State.PAUSED;
  }
  function resume() {
    if (state !== State.PAUSED) return;
    lastTimestamp = 0; // reset dt so no big jump
    state = State.RACING;
  }
  function isPaused() { return state === State.PAUSED; }
  function isRacing() { return state === State.RACING || state === State.COUNTDOWN; }

  function stopRace() {
    cancelAnimationFrame(rafId);
    state = State.IDLE;
  }

  // ─── Render ────────────────────────────────────────────────
  function renderFrame() {
    Renderer.clear();
    Renderer.drawTrack(currentLevel);
    Renderer.drawStartLine(currentLevel);
    if (npc)    Renderer.drawCar(npc,    { bodyColor: '#f87171', windshieldColor: '#7f1d1d' });
    if (player) Renderer.drawCar(player, currentCar, 1);
  }

  // ─── HUD Updates ───────────────────────────────────────────
  function updateHUD() {
    const speedEl    = document.getElementById('hud-speed');
    const timeEl     = document.getElementById('hud-time');
    const npcProgEl  = document.getElementById('hud-npc-progress');
    const progPlayer = document.getElementById('progress-player');
    const progNpc    = document.getElementById('progress-npc');

    if (speedEl) speedEl.innerHTML = Physics.getKmh(player, currentCar) + ' <small>km/h</small>';
    if (timeEl)  timeEl.textContent = formatTime(raceElapsed);

    const pp = Math.min(playerLap.progress, 1) * 100;
    const np = Math.min(npcLap.progress,   1) * 100;
    if (progPlayer) progPlayer.style.width = pp + '%';
    if (progNpc)    progNpc.style.width    = np + '%';
    if (npcProgEl)  npcProgEl.textContent  = Math.round(np) + '%';
  }

  // ─── Countdown UI ──────────────────────────────────────────
  function updateCountdownUI(text) {
    const el = document.getElementById('countdown-text');
    const ov = document.getElementById('countdown-overlay');
    if (el) {
      el.textContent = text;
      // Re-trigger animation
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = '';
    }
    if (ov) ov.classList.remove('hidden');
  }
  function hideCountdown() {
    const ov = document.getElementById('countdown-overlay');
    if (ov) ov.classList.add('hidden');
  }

  // ─── Utils ─────────────────────────────────────────────────
  function formatTime(secs) {
    if (!secs && secs !== 0) return '--';
    const m  = Math.floor(secs / 60);
    const s  = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }

  // ─── Input ─────────────────────────────────────────────────
  function handleKeyDown(e) {
    switch (e.code) {
      case 'ArrowUp':    case 'KeyW': input.accel = true;  e.preventDefault(); break;
      case 'ArrowDown':  case 'KeyS': input.brake = true;  e.preventDefault(); break;
      case 'ArrowLeft':  case 'KeyA': input.left  = true;  e.preventDefault(); break;
      case 'ArrowRight': case 'KeyD': input.right = true;  e.preventDefault(); break;
    }
  }
  function handleKeyUp(e) {
    switch (e.code) {
      case 'ArrowUp':    case 'KeyW': input.accel = false; break;
      case 'ArrowDown':  case 'KeyS': input.brake = false; break;
      case 'ArrowLeft':  case 'KeyA': input.left  = false; break;
      case 'ArrowRight': case 'KeyD': input.right = false; break;
    }
  }

  return {
    startRace, pause, resume, stopRace,
    isPaused, isRacing, formatTime,
    handleKeyDown, handleKeyUp,
    getPlayerProgress: () => playerLap.progress,
    getNpcProgress:    () => npcLap.progress,
  };
})();
