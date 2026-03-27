// ── ui.js ─────────────────────────────────────────────────────
// UI helpers: screen management, dynamic card rendering.

const UI = (() => {

  // ─── Screen Router ─────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
  }

  // ─── Format time ───────────────────────────────────────────
  function fmtTime(secs) {
    if (secs === null || secs === undefined) return '—';
    const m  = Math.floor(secs / 60);
    const s  = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }

  // ─── Draw mini car preview onto a canvas element ─────────────
  function drawCarPreview(canvas, car) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Body
    ctx.fillStyle = car.bodyColor;
    ctx.beginPath();
    ctx.roundRect(w * 0.1, h * 0.2, w * 0.8, h * 0.6, 6);
    ctx.fill();

    // Windshield
    ctx.fillStyle = car.windshieldColor;
    ctx.fillRect(w * 0.45, h * 0.28, w * 0.25, h * 0.44);

    // Headlights
    ctx.fillStyle = '#fffbe0';
    ctx.beginPath(); ctx.arc(w * 0.88, h * 0.32, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.88, h * 0.68, 3, 0, Math.PI * 2); ctx.fill();

    // Stripe
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(w * 0.12, h * 0.44, w * 0.76, h * 0.1);
  }

  // ─── Build Car Selection Cards ─────────────────────────────
  function renderCarCards(selectedId) {
    const grid = document.getElementById('cars-grid');
    if (!grid) return;
    grid.innerHTML = '';

    CARS.forEach(car => {
      const card = document.createElement('div');
      card.className = 'car-card' + (car.id === selectedId ? ' selected' : '');
      card.dataset.carid = car.id;

      const cvs = document.createElement('canvas');
      cvs.width = 120; cvs.height = 60;
      cvs.className = 'car-visual-canvas';

      const stats = [
        { label: 'SPEED',  val: car.topSpeed,     color: '#4f8ef7' },
        { label: 'ACCEL',  val: car.acceleration, color: '#34d399' },
        { label: 'HANDLE', val: car.handling,     color: '#fbbf24' },
      ];

      const barsHtml = stats.map(s => `
        <div class="stat-row">
          <span class="stat-label">${s.label}</span>
          <div class="stat-bar-bg">
            <div class="stat-bar-fill" style="width:${s.val*10}%;background:${s.color}"></div>
          </div>
        </div>
      `).join('');

      card.innerHTML = `
        <div class="car-visual" id="car-visual-${car.id}"></div>
        <div class="car-name">${car.name}</div>
        <div class="car-tag">${car.tag}</div>
        <div class="stat-bars">${barsHtml}</div>
      `;

      grid.appendChild(card);

      // Insert canvas
      const visualDiv = card.querySelector('.car-visual');
      visualDiv.appendChild(cvs);
      drawCarPreview(cvs, car);

      card.addEventListener('click', () => {
        grid.querySelectorAll('.car-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  }

  // ─── Build Level Grid ───────────────────────────────────────
  function renderLevelGrid(selectedId, unlockedIdx) {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';

    LEVELS.forEach(level => {
      const locked = level.id > unlockedIdx;
      const selected = level.id === selectedId;
      const record = Storage.getRecord(level.id);
      const diffDots = Array.from({ length: 5 }, (_, i) =>
        `<div class="diff-dot${i < level.difficulty ? ' active' : ''}"></div>`
      ).join('');

      const card = document.createElement('div');
      card.className = 'level-card' + (locked ? ' locked' : '') + (selected ? ' selected' : '');
      card.dataset.levelid = level.id;
      card.innerHTML = `
        <div class="level-num">${locked ? '🔒' : (level.id + 1)}</div>
        <div class="level-name">${level.name}</div>
        <div class="level-diff">${diffDots}</div>
        <div class="level-best">${record ? fmtTime(record) : ''}</div>
      `;

      if (!locked) {
        card.addEventListener('click', () => {
          grid.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
      }

      grid.appendChild(card);
    });
  }

  // ─── Render Records List ────────────────────────────────────
  function renderRecords() {
    const list = document.getElementById('records-list');
    if (!list) return;
    list.innerHTML = '';

    LEVELS.forEach(level => {
      const record = Storage.getRecord(level.id);
      const item = document.createElement('div');
      item.className = 'record-item';
      item.innerHTML = `
        <div class="record-level-num">${level.id + 1}</div>
        <div class="record-level-name">${level.name}</div>
        ${record
          ? `<div class="record-time">${fmtTime(record)}</div>`
          : `<div class="record-none">No record yet</div>`
        }
      `;
      list.appendChild(item);
    });
  }

  // ─── Results Screen ─────────────────────────────────────────
  function showResults(playerTime, npcTime, levelId) {
    const playerFinished = playerTime > 0;
    const npcFinished    = npcTime > 0;

    let win, icon;
    if (!npcFinished) {
      win = true;  // NPC gave up / didn't finish
    } else if (!playerFinished) {
      win = false;
    } else {
      win = playerTime <= npcTime;
    }

    const winnerEl  = document.getElementById('results-winner');
    const iconEl    = document.getElementById('results-winner-icon');
    const textEl    = document.getElementById('results-winner-text');
    winnerEl.className = 'results-winner ' + (win ? 'win' : 'loss');
    iconEl.textContent = win ? '🏆' : '💨';
    textEl.textContent = win ? 'You Win!' : 'NPC Wins!';

    document.getElementById('results-player-time').textContent = playerFinished ? fmtTime(playerTime) : 'DNF';
    document.getElementById('results-npc-time').textContent    = npcFinished    ? fmtTime(npcTime)    : 'DNF';

    // Record
    const prevRecord = Storage.getRecord(levelId);
    const newRecord  = playerFinished && (!prevRecord || playerTime < prevRecord);
    if (newRecord) Storage.setRecord(levelId, playerTime);

    document.getElementById('results-best-time').textContent = Storage.getRecord(levelId) ? fmtTime(Storage.getRecord(levelId)) : '—';
    const badge = document.getElementById('results-new-record');
    badge.style.display = newRecord ? 'inline' : 'none';

    // Unlock next level if won
    if (win && playerFinished) Storage.unlockLevel(levelId + 1);

    // Update HUD level
    document.getElementById('hud-level').textContent = levelId + 1;

    showScreen('screen-results');
  }

  return { showScreen, renderCarCards, renderLevelGrid, renderRecords, showResults, fmtTime };
})();
