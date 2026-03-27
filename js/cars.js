// ── cars.js ──────────────────────────────────────────────────
// Car definitions: 3 cars with distinct stat profiles.

const CARS = [
  {
    id: 0,
    name: 'Falcon',
    tag: 'HIGH SPEED',
    color: '#4f8ef7',      // blue
    bodyColor: '#3a7de0',
    windshieldColor: '#1a3a7a',
    // Stats 1–10
    topSpeed:     9,       // fast top speed
    acceleration: 5,       // slow to get there
    handling:     6,       // average turning
    // Physics derived values (set in physics.js)
  },
  {
    id: 1,
    name: 'Striker',
    tag: 'QUICK START',
    color: '#f87171',      // red
    bodyColor: '#e05555',
    windshieldColor: '#7a1a1a',
    topSpeed:     7,
    acceleration: 9,       // snappy acceleration
    handling:     6,
  },
  {
    id: 2,
    name: 'Phantom',
    tag: 'PRECISION',
    color: '#34d399',      // green
    bodyColor: '#22b37a',
    windshieldColor: '#0a4a2a',
    topSpeed:     7,
    acceleration: 6,
    handling:     9,       // best cornering
  },
];
