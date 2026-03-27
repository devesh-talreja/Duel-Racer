// ── levels.js ─────────────────────────────────────────────────
// 15 level/track definitions.
// Each track is defined by a series of WAYPOINTS (center-line path),
// a track WIDTH, colors, NPC difficulty, and a theme name.
// Waypoints are in canvas-space (800 x 600 px virtual canvas).

const LEVELS = [
  {
    id: 0, name: 'City Road',        theme: '#4f8ef7', difficulty: 1,
    npcSpeed: 0.38, npcMistake: 0.06,
    trackWidth: 80,
    bgColor: '#1a2035', roadColor: '#2a3050', kerb1: '#f7f7f7', kerb2: '#e05555',
    waypoints: buildOval(400, 300, 300, 180),
  },
  {
    id: 1, name: 'Suburban Track',   theme: '#7b5cf0', difficulty: 1,
    npcSpeed: 0.41, npcMistake: 0.055,
    trackWidth: 75,
    bgColor: '#1a2225', roadColor: '#283035', kerb1: '#f0f0f0', kerb2: '#4f8ef7',
    waypoints: buildRoundedRect(80, 80, 720, 520, 80),
  },
  {
    id: 2, name: 'Night Road',       theme: '#2d1b69', difficulty: 1,
    npcSpeed: 0.44, npcMistake: 0.05,
    trackWidth: 72,
    bgColor: '#0a0a18', roadColor: '#1a1a2e', kerb1: '#ffe066', kerb2: '#222250',
    waypoints: buildFigureEight(400, 300, 220, 150),
  },
  {
    id: 3, name: 'Highway Loop',     theme: '#22c55e', difficulty: 2,
    npcSpeed: 0.47, npcMistake: 0.045,
    trackWidth: 90,
    bgColor: '#0f1f10', roadColor: '#1a2e1a', kerb1: '#ffffff', kerb2: '#22c55e',
    waypoints: buildOval(400, 300, 340, 220),
  },
  {
    id: 4, name: 'Tunnel Section',   theme: '#fbbf24', difficulty: 2,
    npcSpeed: 0.50, npcMistake: 0.04,
    trackWidth: 68,
    bgColor: '#1a1205', roadColor: '#2a2010', kerb1: '#fbbf24', kerb2: '#92400e',
    waypoints: buildSnake(400, 300, 300, 160, 4),
  },
  {
    id: 5, name: 'Urban Turns',      theme: '#f87171', difficulty: 2,
    npcSpeed: 0.52, npcMistake: 0.035,
    trackWidth: 70,
    bgColor: '#1a1015', roadColor: '#251520', kerb1: '#f87171', kerb2: '#7f1d1d',
    waypoints: buildRoundedRect(90, 90, 710, 510, 50),
  },
  {
    id: 6, name: 'Bridge Track',     theme: '#38bdf8', difficulty: 3,
    npcSpeed: 0.54, npcMistake: 0.03,
    trackWidth: 66,
    bgColor: '#051520', roadColor: '#0a2030', kerb1: '#38bdf8', kerb2: '#0369a1',
    waypoints: buildFigureEight(400, 300, 250, 170),
  },
  {
    id: 7, name: 'Industrial Route', theme: '#fb923c', difficulty: 3,
    npcSpeed: 0.56, npcMistake: 0.025,
    trackWidth: 64,
    bgColor: '#1a1205', roadColor: '#241a08', kerb1: '#fb923c', kerb2: '#7c2d12',
    waypoints: buildSnake(400, 300, 320, 180, 5),
  },
  {
    id: 8, name: 'Rainy Road',       theme: '#94a3b8', difficulty: 3,
    npcSpeed: 0.58, npcMistake: 0.02,
    trackWidth: 62,
    bgColor: '#111620', roadColor: '#1e2535', kerb1: '#94a3b8', kerb2: '#334155',
    waypoints: buildOval(400, 300, 320, 200, true),
  },
  {
    id: 9, name: 'Coastal Road',     theme: '#06b6d4', difficulty: 4,
    npcSpeed: 0.60, npcMistake: 0.018,
    trackWidth: 60,
    bgColor: '#051018', roadColor: '#0a1525', kerb1: '#06b6d4', kerb2: '#164e63',
    waypoints: buildCoastal(),
  },
  {
    id: 10, name: 'Mountain Road',   theme: '#a8a29e', difficulty: 4,
    npcSpeed: 0.62, npcMistake: 0.015,
    trackWidth: 58,
    bgColor: '#12100e', roadColor: '#1c1814', kerb1: '#d6d3d1', kerb2: '#57534e',
    waypoints: buildMountain(),
  },
  {
    id: 11, name: 'Neon City',       theme: '#e879f9', difficulty: 4,
    npcSpeed: 0.64, npcMistake: 0.013,
    trackWidth: 56,
    bgColor: '#100a1a', roadColor: '#1a1028', kerb1: '#e879f9', kerb2: '#86198f',
    waypoints: buildFigureEight(400, 300, 280, 190),
  },
  {
    id: 12, name: 'Tight Circuit',   theme: '#f59e0b', difficulty: 5,
    npcSpeed: 0.66, npcMistake: 0.010,
    trackWidth: 54,
    bgColor: '#1a1000', roadColor: '#281800', kerb1: '#f59e0b', kerb2: '#92400e',
    waypoints: buildRoundedRect(110, 110, 690, 490, 30),
  },
  {
    id: 13, name: 'City Highway',    theme: '#818cf8', difficulty: 5,
    npcSpeed: 0.69, npcMistake: 0.008,
    trackWidth: 52,
    bgColor: '#080c20', roadColor: '#101830', kerb1: '#818cf8', kerb2: '#312e81',
    waypoints: buildSnake(400, 300, 340, 200, 6),
  },
  {
    id: 14, name: 'Championship',    theme: '#fbbf24', difficulty: 5,
    npcSpeed: 0.73, npcMistake: 0.005,
    trackWidth: 50,
    bgColor: '#0a0800', roadColor: '#181200', kerb1: '#fbbf24', kerb2: '#b45309',
    waypoints: buildChampionship(),
  },
];

// ─── Track Generator Helpers ──────────────────────────────────

function buildOval(cx, cy, rx, ry, wobble = false) {
  const pts = [];
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const wx = wobble ? Math.sin(a * 3) * 18 : 0;
    const wy = wobble ? Math.cos(a * 5) * 12 : 0;
    pts.push({ x: cx + Math.cos(a) * rx + wx, y: cy + Math.sin(a) * ry + wy });
  }
  return pts;
}

function buildRoundedRect(x1, y1, x2, y2, r) {
  const pts = [];
  const add = (ax, ay) => pts.push({ x: ax, y: ay });
  const corner = (cx, cy, startA, steps = 8) => {
    for (let i = 0; i <= steps; i++) {
      const a = startA + (i / steps) * (Math.PI / 2);
      add(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
  };
  // top edge left→right
  for (let x = x1 + r; x <= x2 - r; x += 30) add(x, y1);
  corner(x2 - r, y1 + r, -Math.PI / 2);
  for (let y = y1 + r; y <= y2 - r; y += 30) add(x2, y);
  corner(x2 - r, y2 - r, 0);
  for (let x = x2 - r; x >= x1 + r; x -= 30) add(x, y2);
  corner(x1 + r, y2 - r, Math.PI / 2);
  for (let y = y2 - r; y >= y1 + r; y -= 30) add(x1, y);
  corner(x1 + r, y1 + r, Math.PI);
  return pts;
}

function buildFigureEight(cx, cy, rx, ry) {
  const pts = [];
  const steps = 60;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = cx + rx * Math.sin(t);
    const y = cy + ry * Math.sin(t) * Math.cos(t);
    pts.push({ x, y });
  }
  return pts;
}

function buildSnake(cx, cy, w, h, turns) {
  const pts = [];
  const segW = w / turns;
  const startX = cx - w / 2;
  const topY = cy - h / 2;
  const botY = cy + h / 2;
  for (let i = 0; i <= turns; i++) {
    const x = startX + i * segW;
    const y = i % 2 === 0 ? topY : botY;
    // arc between segments
    if (i > 0) {
      const prevX = startX + (i - 1) * segW;
      const prevY = i % 2 === 0 ? botY : topY;
      const arcCX = x;
      const arcCY = (prevY + y) / 2;
      const r = (botY - topY) / 2;
      const startA = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      for (let s = 0; s <= 10; s++) {
        const a = startA + (i % 2 === 0 ? 1 : -1) * (s / 10) * Math.PI;
        pts.push({ x: arcCX + Math.cos(a) * 0, y: arcCY + Math.sin(a) * r });
      }
    }
    // straight
    const steps = 12;
    const prevY2 = i === 0 ? topY : (i % 2 === 0 ? topY : botY);
    const dir = i % 2 === 0 ? 1 : -1;
    if (i < turns) {
      for (let s = 0; s < steps; s++) {
        const frac = s / steps;
        pts.push({ x: x + frac * segW * 0.8, y: (i % 2 === 0 ? topY : botY) });
      }
    }
  }
  // close with big curve back
  return simplifyPath(pts, 6);
}

function buildCoastal() {
  return [
    {x:100,y:150},{x:200,y:120},{x:320,y:100},{x:440,y:130},{x:540,y:110},
    {x:650,y:140},{x:720,y:200},{x:700,y:300},{x:650,y:380},{x:560,y:420},
    {x:450,y:460},{x:340,y:480},{x:220,y:460},{x:130,y:400},{x:80,y:310},
    {x:80,y:220},{x:100,y:150}
  ];
}

function buildMountain() {
  return [
    {x:100,y:200},{x:180,y:120},{x:300,y:90},{x:400,y:130},{x:480,y:80},
    {x:600,y:100},{x:700,y:180},{x:720,y:300},{x:680,y:420},{x:560,y:490},
    {x:400,y:510},{x:240,y:490},{x:130,y:420},{x:70,y:320},{x:80,y:260},
    {x:100,y:200}
  ];
}

function buildChampionship() {
  return [
    {x:120,y:300},{x:120,y:140},{x:300,y:80},{x:500,y:80},
    {x:680,y:120},{x:720,y:220},{x:680,y:300},{x:620,y:340},
    {x:680,y:390},{x:720,y:460},{x:650,y:530},{x:450,y:540},
    {x:300,y:510},{x:200,y:460},{x:150,y:390},{x:200,y:340},
    {x:140,y:300},{x:120,y:300}
  ];
}

function simplifyPath(pts, minDist) {
  if (pts.length < 2) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const prev = out[out.length - 1];
    const dx = pts[i].x - prev.x;
    const dy = pts[i].y - prev.y;
    if (Math.sqrt(dx * dx + dy * dy) >= minDist) out.push(pts[i]);
  }
  return out;
}
