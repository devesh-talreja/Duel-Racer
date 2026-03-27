// ── npc.js ────────────────────────────────────────────────────
// NPC AI: waypoint following with level-based difficulty.

const NPC = (() => {

  function createNPCState(x, y, angle) {
    return {
      x, y, angle,
      speed: 0,
      waypointIdx: 0,
      mistakeTimer: 0,
      mistakeDir: 0,
    };
  }

  function update(npcState, waypoints, level, dt) {
    if (!waypoints || waypoints.length < 2) return;

    const npcSpeedPx = level.npcSpeed * 380;   // px/s top speed for NPC
    const mistakeRate = level.npcMistake;       // probability per second

    // ── Mistake system (lower levels NPC wobbles occasionally)
    npcState.mistakeTimer -= dt;
    if (npcState.mistakeTimer <= 0) {
      if (Math.random() < mistakeRate) {
        npcState.mistakeDir   = (Math.random() < 0.5 ? 1 : -1) * 0.3;
        npcState.mistakeTimer = 0.4 + Math.random() * 0.6;
      } else {
        npcState.mistakeDir   = 0;
        npcState.mistakeTimer = 0.2;
      }
    }

    // ── Steer toward next waypoint
    const wi  = npcState.waypointIdx % waypoints.length;
    const wp  = waypoints[wi];
    const dx  = wp.x - npcState.x;
    const dy  = wp.y - npcState.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const targetAngle = Math.atan2(dy, dx);

    // Advance waypoint when close enough
    if (dist < 24) {
      npcState.waypointIdx = (npcState.waypointIdx + 1) % waypoints.length;
    }

    // Smooth angle approach
    let angleDiff = targetAngle - npcState.angle;
    while (angleDiff >  Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const turnSpeed = 3.0;
    npcState.angle += (angleDiff * turnSpeed + npcState.mistakeDir) * dt;

    // Speed management — slow down in tight corners
    const cornerSeverity = Math.min(Math.abs(angleDiff) / (Math.PI * 0.5), 1);
    const cornerSpeedMult = 1 - cornerSeverity * 0.40;
    const targetSpeed = npcSpeedPx * cornerSpeedMult;

    const accelRate = 180;
    if (npcState.speed < targetSpeed) {
      npcState.speed = Math.min(npcState.speed + accelRate * dt, targetSpeed);
    } else {
      npcState.speed = Math.max(npcState.speed - accelRate * 1.5 * dt, targetSpeed);
    }

    npcState.x += Math.cos(npcState.angle) * npcState.speed * dt;
    npcState.y += Math.sin(npcState.angle) * npcState.speed * dt;
  }

  return { createNPCState, update };
})();
