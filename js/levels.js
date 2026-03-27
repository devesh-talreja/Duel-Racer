// ── levels.js ─────────────────────────────────────────────────
// 15 level/track definitions.
// Each track is defined by a series of WAYPOINTS (center-line path),
// a track WIDTH, colors, NPC difficulty, and a theme name.
// Waypoints are in canvas-space (800 x 600 px virtual canvas).

const LEVELS = [
  {
    id: 0, name: 'City Road',        theme: '#4f8ef7', difficulty: 1,
    npcSpeed: 0.38, npcMistake: 0.06,
    trackWidth: 130,
    bgColor: '#1a2035', roadColor: '#2a3050', kerb1: '#f7f7f7', kerb2: '#e05555',
    waypoints: alignTrackStart(buildOval(400, 300, 300, 180)),
  },
  {
    id: 1, name: 'Suburban Track',   theme: '#7b5cf0', difficulty: 1,
    npcSpeed: 0.41, npcMistake: 0.055,
    trackWidth: 130,
    bgColor: '#1a2225', roadColor: '#283035', kerb1: '#f0f0f0', kerb2: '#4f8ef7',
    waypoints: alignTrackStart(buildRoundedRect(80, 80, 720, 520, 80)),
  },
  {
    id: 2, name: 'Night Road',       theme: '#2d1b69', difficulty: 1,
    npcSpeed: 0.44, npcMistake: 0.05,
    trackWidth: 130,
    bgColor: '#0a0a18', roadColor: '#1a1a2e', kerb1: '#ffe066', kerb2: '#222250',
    waypoints: alignTrackStart(buildFigureEight(400, 300, 220, 150)),
  },
  {
    id: 3, name: 'Diamond Circuit',  theme: '#a855f7', difficulty: 3,
    npcSpeed: 0.48, npcMistake: 0.045,
    trackWidth: 130,
    bgColor: '#140f1a', roadColor: '#261633', kerb1: '#a855f7', kerb2: '#581c87',
    waypoints: alignTrackStart(buildRoundedRect(240, 140, 560, 460, 70, Math.PI / 4)), // Rotated Square
  },
  {
    id: 4, name: 'Clover Circuit',   theme: '#f43f5e', difficulty: 4,
    npcSpeed: 0.52, npcMistake: 0.035,
    trackWidth: 115,
    bgColor: '#1a0f14', roadColor: '#2d1622', kerb1: '#f43f5e', kerb2: '#881337',
    waypoints: alignTrackStart(buildClover(400, 300, 50, 3)), // Wider inner void, rotated logically
  },
  {
    id: 5, name: 'Neon Cross',       theme: '#06b6d4', difficulty: 4,
    npcSpeed: 0.55, npcMistake: 0.03,
    trackWidth: 130,
    bgColor: '#0a101a', roadColor: '#121828', kerb1: '#06b6d4', kerb2: '#164e63',
    waypoints: alignTrackStart(buildClover(400, 300, 55, 4, 0)), // 4-leaf shape, Plus configuration
  },
  {
    id: 6, name: 'Twin Void',        theme: '#8b5cf6', difficulty: 5,
    npcSpeed: 0.58, npcMistake: 0.025,
    trackWidth: 120,
    bgColor: '#16121f', roadColor: '#1e1a2f', kerb1: '#8b5cf6', kerb2: '#4c1d95',
    waypoints: alignTrackStart(buildPeanut(400, 300, 320, 500)), // Parametric Pinched Bone Layout
  },
  {
    id: 7, name: 'Binary Orbit',     theme: '#fcd34d', difficulty: 5,
    npcSpeed: 0.62, npcMistake: 0.02,
    trackWidth: 110,
    bgColor: '#191505', roadColor: '#28200a', kerb1: '#fcd34d', kerb2: '#b45309',
    waypoints: alignTrackStart(buildClover(400, 300, 60, 2, Math.PI / 2)), // 2-leaf pinched oval rotated natively
  },
  {
    id: 8, name: 'Velocity Box',     theme: '#10b981', difficulty: 6,
    npcSpeed: 0.65, npcMistake: 0.015,
    trackWidth: 105,
    bgColor: '#051810', roadColor: '#0a2318', kerb1: '#10b981', kerb2: '#047857',
    waypoints: alignTrackStart(buildRoundedRect(120, 80, 680, 520, 60)), // Massive straightaways with tight 60px corners
  }
];

// ─── Track Generator Helpers ──────────────────────────────────

function alignTrackStart(pts) {
  if (!pts || pts.length < 2) return pts;
  
  // 1. Find all points near the bottom (max Y edge)
  let maxY = -Infinity;
  for (let p of pts) if (p.y > maxY) maxY = p.y;
  
  let candidates = [];
  for (let i = 0; i < pts.length; i++) {
    if (Math.abs(pts[i].y - maxY) < 2.0) candidates.push(i);
  }
  
  // 2. Pick candidate closest to horizontal center (X=400)
  let bestIdx = candidates[0];
  let minDx = Infinity;
  for (let idx of candidates) {
    let dx = Math.abs(pts[idx].x - 400);
    if (dx < minDx) {
      minDx = dx;
      bestIdx = idx;
    }
  }
  
  // 3. Shift array so bestIdx is 0
  let shifted = pts.slice(bestIdx).concat(pts.slice(0, bestIdx));
  
  // 4. Determine direction. We want Left (decreasing X).
  let trendX = shifted[5 % shifted.length].x - shifted[0].x;
  if (trendX > 0) {
    const first = shifted[0];
    const rest = shifted.slice(1).reverse();
    shifted = [first, ...rest];
  }
  return shifted;
}

function buildOval(cx, cy, rx, ry, wobble = false, angleOffset = 0) {
  const pts = [];
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2 + angleOffset;
    const wx = wobble ? Math.sin(a * 3) * 18 : 0;
    const wy = wobble ? Math.cos(a * 5) * 12 : 0;
    pts.push({ x: cx + Math.cos(a) * rx + wx, y: cy + Math.sin(a) * ry + wy });
  }
  return pts;
}

function buildRoundedRect(x1, y1, x2, y2, r, angleOffset = 0) {
  const pts = [];
  const add = (ax, ay) => pts.push({ x: ax, y: ay });
  const corner = (cx, cy, startA, steps = 12) => {
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

  if (angleOffset !== 0) {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const cosA = Math.cos(angleOffset);
    const sinA = Math.sin(angleOffset);
    pts.forEach(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      p.x = cx + dx * cosA - dy * sinA;
      p.y = cy + dx * sinA + dy * cosA;
    });
  }

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

function buildClover(cx, cy, scale, leaves, angleOffset = 0) {
  const pts = [];
  const steps = 120;
  for (let i = 0; i < steps; i++) {
    const baseT = (i / steps) * Math.PI * 2;
    // Boost base from 2.2 to 3.0 so the center void is distinct and hollow
    const r = scale * (3.0 + Math.cos(leaves * baseT)); 
    const px = r * Math.cos(baseT);
    const py = r * Math.sin(baseT);
    
    // Physical rotation matrix
    const x = cx + px * Math.cos(angleOffset) - py * Math.sin(angleOffset);
    const y = cy + px * Math.sin(angleOffset) + py * Math.cos(angleOffset);
    
    pts.push({ x, y });
  }
  return pts;
}

function buildPeanut(cx, cy, rx, ry) {
  const pts = [];
  const steps = 100;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = cx + rx * Math.cos(t);
    // Pinches the y-axis inwards by 65% when approaching horizontal middle
    const pinch = 1 - 0.65 * Math.pow(Math.sin(t), 2);
    const y = cy + ry * Math.sin(t) * pinch;
    pts.push({ x, y });
  }
  return pts;
}




