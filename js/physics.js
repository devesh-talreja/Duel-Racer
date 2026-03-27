// ── physics.js ────────────────────────────────────────────────
// Car physics: velocity, acceleration, braking, steering.

const Physics = (() => {

  // Derived max speeds (px/s on virtual 800x600 canvas)
  // Stat 1-10 → speed range 120–320 px/s
  function maxSpeed(car) {
    return 120 + (car.topSpeed - 1) * 22;   // 142 – 318 px/s
  }
  // Acceleration px/s²
  function accelRate(car) {
    return 60 + (car.acceleration - 1) * 22;
  }
  // Turn rate rad/s (speed-dependent, faster = harder to turn)
  function turnRate(car) {
    return 1.4 + (car.handling - 1) * 0.12;
  }

  const FRICTION    = 0.94;  // velocity multiplier per frame (natural decel)
  const BRAKE_FORCE = 340;   // px/s²

  function createCarState(x, y, angle) {
    return { x, y, angle, speed: 0, vx: 0, vy: 0 };
  }

  function update(state, car, input, dt, levelSpeedBonus = 0) {
    const ms  = maxSpeed(car) * (1 + levelSpeedBonus * 0.04);
    const ar  = accelRate(car);
    const tr  = turnRate(car);

    // Acceleration / Brake
    if (input.accel) {
      state.speed = Math.min(state.speed + ar * dt, ms);
    } else if (input.brake) {
      if (state.speed > 0) {
        state.speed = Math.max(state.speed - BRAKE_FORCE * dt, 0);
      } else {
        // Reverse (limited)
        state.speed = Math.max(state.speed - ar * 0.5 * dt, -ms * 0.3);
      }
    } else {
      // Friction / drag
      state.speed *= Math.pow(FRICTION, dt * 60);
    }

    // Steering — only effective when moving
    const speedFactor = Math.abs(state.speed) / ms;
    if (Math.abs(state.speed) > 5) {
      const dir = state.speed >= 0 ? 1 : -1;
      if (input.left)  state.angle -= tr * speedFactor * dt * dir;
      if (input.right) state.angle += tr * speedFactor * dt * dir;
    }

    // Velocity integration
    state.x += Math.cos(state.angle) * state.speed * dt;
    state.y += Math.sin(state.angle) * state.speed * dt;
  }

  function getKmh(state, car) {
    // Pixel speed → km/h (calibrated: maxSpeed stat=9 ≈ 280 km/h)
    const ms = maxSpeed(car);
    return Math.round((Math.abs(state.speed) / ms) * 280);
  }

  return { createCarState, update, maxSpeed, getKmh };
})();
