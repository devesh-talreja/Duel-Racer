# Duel Racer 🏎

![Duel Racer Gameplay](https://img.shields.io/badge/Status-Beta-brightgreen.svg)
<br>
<img src="favicon.png" width="96" alt="Duel Racer Logo">

**Duel Racer** is an intensely fast-paced, top-down 1v1 racing game completely built from scratch using pure HTML, CSS, and Vanilla JavaScript. Challenge a brutally adaptive computer driver across 10 radically distinct, mathematically generated track geometries. 

Master the momentum-based drifting physics, razor-thin braking zones, and perfect your racing lines to shave off milliseconds.

🏎️ **[Play Duel Racer Live Here!](https://duelracer.netlify.app/)**  *(Beat Level 10… if you can)*

---

## 🌟 Key Features

* **Custom Physics Engine**: Real-time momentum, solid restitution bounding walls, off-track friction penalties, and drifting mechanics.
* **Algorithmic NPC Competitor**: The computer driver mathematically scales with your speed, dynamically throttles for tight hairpins, makes probabilistic mistakes under pressure, and actively pursues the flawless racing line.
* **Local Persistence**: Integrated database automatically saves your unlocked levels, fastest lap times, and customizable keyboard sensitivities.
* **Controller/Keyboard Support**: Full `WASD` / `Arrow Key` bindings for both racing and navigating the fluid, animated UI menus.

---

## 🚗 The Garage
Choose from 6 distinct vehicle chassis based on your racing style:
1. **Falcon** (High Speed focus)
2. **Striker** (Quick Start acceleration)
3. **Phantom** (Precision handling)
4. **Juggernaut** (Brute Force top speed)
5. **Nova** (Drift King cornering)
6. **Vortex** (Perfectly balanced)

---

## 🏁 The Circuits
Duel Racer currently features exactly **10 highly unique, hand-crafted parametric levels** that scale aggressively in difficulty. The mathematical engine guarantees pixel-perfect smooth corners and brutal physics restrictions.

* **Level 1** - City Road *(Standard Oval)*
* **Level 2** - Suburban Track *(Wide Rectangle)*
* **Level 3** - Night Road *(Sweeping Figure-Eight)*
* **Level 4** - Diamond Circuit *(45-Degree Rigid Square)*
* **Level 5** - Clover Circuit *(3-Leaf Parametric Curve)*
* **Level 6** - Neon Cross *(Massive Hollow 4-Leaf Star)*
* **Level 7** - Twin Void *(Pinched "Peanut" Hourglass)*
* **Level 8** - Binary Orbit *(High-Velocity Pinched Oval)*
* **Level 9** - Velocity Box *(Brutal 60px Hairpins on a long box)*
* **Level 10** - Nebula Star *(Technical 5-Leaf Sweeping Core)*

---

## 🛠️ How to Play Locally

Duel Racer relies entirely on client-side browser technology and does not require a backend node server to compile. 

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/devesh-talreja/duel-racer.git
   ```
2. **Run the Game:**
   * **Option A**: Simply double-click on `index.html` to open the game natively in your default web browser! No installation required.
   * **Option B**: If you prefer, run a local testing server in your terminal:
     ```bash
     npx serve .
     ```
     Then navigate to `http://localhost:3000`

---

## 🎮 Controls

* **W / Up Arrow**: Accelerate
* **S / Down Arrow**: Brake / Reverse
* **A / Left Arrow**: Steer Left
* **D / Right Arrow**: Steer Right
* **P / Esc**: Pause / Resume Race
* **Enter**: Select UI Options

---

## 🚀 Future Roadmap

Duel Racer is actively evolving! Planned future updates include:
* **Grand Prix Tier (Levels 11-20)**: Complex, asymmetrical street circuits and brutal choke points.
* **Car Progression Mechanics**: Unlock the later cars natively by defeating certain NPC bosses.
* **Visual Polish**: Dynamic particle effects (tire smoke, grass dust) and animated crowd elements.
* **Mini-Map HUD**: A transparent 2D overlay to track you and the AI globally.
* **Continuous Engine Fixes**: Ongoing optimizations for Keyboard/UI Focus retention during pause toggling and input cleanup.

---

## 🤝 Contributing

We would absolutely love your help expanding Duel Racer! 

If you have ideas for new tracks, car models, UI enhancements, or run into any engine bugs, your contributions are highly welcome.

1. **Star this Repository** to show your support!
2. **Fork** the project into your own workspace.
3. **Submit an Issue** to suggest features, report bugs, or discuss huge structural changes.
4. **Create a Pull Request** with your code upgrades. 

Whether you're fixing a minor UI typo or writing an entirely new mathematical algorithm for Level 11, feel free to dive into the codebase. 
