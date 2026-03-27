// ── main.js ───────────────────────────────────────────────────
// Entry point: wires all event listeners and orchestrates screen flow.

document.addEventListener('DOMContentLoaded', () => {

  // ─── Load saved state ──────────────────────────────────────
  let selectedCarId   = Storage.getSelectedCar();
  let selectedLevelId = Storage.getSelectedLevel();
  let unlockedLevel   = Storage.getUnlockedLevel();

  // ─── Home Buttons ──────────────────────────────────────────
  document.getElementById('btn-start').addEventListener('click', () => {
    launchRace();
  });

  document.getElementById('btn-cars').addEventListener('click', () => {
    UI.renderCarCards(selectedCarId);
    UI.showScreen('screen-cars');
  });

  document.getElementById('btn-levels').addEventListener('click', () => {
    UI.renderLevelGrid(selectedLevelId, unlockedLevel);
    UI.showScreen('screen-levels');
  });

  document.getElementById('btn-records').addEventListener('click', () => {
    UI.renderRecords();
    UI.showScreen('screen-records');
  });

  document.getElementById('btn-controls').addEventListener('click', () => {
    UI.showScreen('screen-controls');
  });

  // ─── Car Selection ─────────────────────────────────────────
  document.getElementById('cars-back').addEventListener('click', () => {
    UI.showScreen('screen-home');
  });

  document.getElementById('cars-confirm').addEventListener('click', () => {
    const sel = document.querySelector('.car-card.selected');
    if (sel) {
      selectedCarId = parseInt(sel.dataset.carid, 10);
      Storage.setSelectedCar(selectedCarId);
    }
    UI.showScreen('screen-home');
  });

  // ─── Level Selection ────────────────────────────────────────
  document.getElementById('levels-back').addEventListener('click', () => {
    UI.showScreen('screen-home');
  });

  document.getElementById('levels-confirm').addEventListener('click', () => {
    const sel = document.querySelector('.level-card.selected:not(.locked)');
    if (sel) {
      selectedLevelId = parseInt(sel.dataset.levelid, 10);
      Storage.setSelectedLevel(selectedLevelId);
    }
    launchRace();
  });

  // ─── Records ───────────────────────────────────────────────
  document.getElementById('records-back').addEventListener('click', () => {
    UI.showScreen('screen-home');
  });

  // ─── Controls ──────────────────────────────────────────────
  document.getElementById('controls-back').addEventListener('click', () => {
    UI.showScreen('screen-home');
  });

  // ─── Race / Pause Controls ──────────────────────────────────
  document.getElementById('btn-pause').addEventListener('click', togglePause);

  document.getElementById('btn-resume').addEventListener('click', () => {
    hidePause();
    Game.resume();
  });

  document.getElementById('btn-restart').addEventListener('click', () => {
    hidePause();
    Game.stopRace();
    launchRace();
  });

  document.getElementById('btn-quit').addEventListener('click', () => {
    hidePause();
    Game.stopRace();
    UI.showScreen('screen-home');
  });

  // ─── Global keyboard (pause + race input) ──────────────────
  document.addEventListener('keydown', e => {
    Game.handleKeyDown(e);

    if ((e.code === 'KeyP' || e.code === 'Escape') && Game.isRacing()) {
      e.preventDefault();
      togglePause();
    }
    if (e.code === 'KeyR' && Game.isRacing()) {
      e.preventDefault();
      hidePause();
      Game.stopRace();
      launchRace();
    }
  });
  document.addEventListener('keyup', Game.handleKeyUp);

  // Resize canvas when window resizes
  window.addEventListener('resize', () => {
    if (document.getElementById('screen-race').classList.contains('active')) {
      // Renderer.resize() is called inside game loop – safe
    }
  });

  // ─── Results Buttons ────────────────────────────────────────
  document.getElementById('btn-retry').addEventListener('click', () => {
    UI.showScreen('screen-race');
    launchRace();
  });

  document.getElementById('btn-next-level').addEventListener('click', () => {
    const nextId = Math.min(selectedLevelId + 1, LEVELS.length - 1);
    unlockedLevel = Storage.getUnlockedLevel();
    if (nextId <= unlockedLevel) {
      selectedLevelId = nextId;
      Storage.setSelectedLevel(selectedLevelId);
    }
    UI.showScreen('screen-race');
    launchRace();
  });

  document.getElementById('btn-results-home').addEventListener('click', () => {
    UI.showScreen('screen-home');
  });

  // ─── Pause helpers ──────────────────────────────────────────
  function togglePause() {
    if (Game.isPaused()) {
      hidePause();
      Game.resume();
    } else {
      showPause();
      Game.pause();
    }
  }
  function showPause() { document.getElementById('pause-overlay').style.display = 'flex'; }
  function hidePause() { document.getElementById('pause-overlay').style.display = 'none'; }

  // ─── Launch Race ───────────────────────────────────────────
  function launchRace() {
    const car   = CARS[selectedCarId]          || CARS[0];
    const level = LEVELS[selectedLevelId]      || LEVELS[0];

    // Update HUD level display
    document.getElementById('hud-level').textContent = selectedLevelId + 1;

    // Reset progress bars
    document.getElementById('progress-player').style.width = '0%';
    document.getElementById('progress-npc').style.width    = '0%';
    document.getElementById('hud-npc-progress').textContent = '0%';

    // Reset countdown
    const cdOv = document.getElementById('countdown-overlay');
    cdOv.classList.remove('hidden');
    document.getElementById('countdown-text').textContent = '3';

    // Hide pause overlay
    hidePause();

    UI.showScreen('screen-race');

    // Small delay to let CSS transition complete before starting canvas
    setTimeout(() => {
      Game.startRace(level, car, ({ playerTime, npcTime, playerFinished }) => {
        unlockedLevel = Storage.getUnlockedLevel();
        UI.showResults(
          playerFinished ? playerTime : 0,
          npcTime,
          selectedLevelId
        );
      });
    }, 80);
  }

  // ─── Initial screen ─────────────────────────────────────────
  UI.showScreen('screen-home');
});
