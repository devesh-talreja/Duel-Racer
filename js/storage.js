// ── storage.js ──────────────────────────────────────────────
// Thin localStorage wrapper for all persistent game data.

const Storage = (() => {
  const PREFIX = 'duelracer_';
  const key = k => PREFIX + k;

  const get = (k, fallback = null) => {
    try {
      const v = localStorage.getItem(key(k));
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  };
  const set = (k, v) => {
    try { localStorage.setItem(key(k), JSON.stringify(v)); } catch {}
  };

  return {
    getSelectedCar:    ()      => get('selectedCar', 0),
    setSelectedCar:    (id)    => set('selectedCar', id),
    getSelectedLevel:  ()      => get('selectedLevel', 0),
    setSelectedLevel:  (id)    => set('selectedLevel', id),
    getLastLevel:      ()      => get('lastLevel', 0),
    setLastLevel:      (id)    => set('lastLevel', id),
    getUnlockedLevel:  ()      => get('unlockedLevel', 0),   // highest unlocked index
    unlockLevel:       (id)    => {
      const cur = get('unlockedLevel', 0);
      if (id > cur) set('unlockedLevel', id);
    },
    getRecord:         (lvl)   => get('record_' + lvl, null),
    setRecord:         (lvl, t)=> set('record_' + lvl, t),
  };
})();
