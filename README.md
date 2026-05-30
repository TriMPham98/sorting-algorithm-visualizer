# Sorting Algorithm Visualizer

A beautiful browser-based 3D visualization of **35+ sorting algorithms** with real-time procedurally generated audio, live pseudocode stepping, and a unique "Race" mode for side-by-side comparisons. Built with [three.js](https://threejs.org/) and the Web Audio API.

![Sorting Visualizer](https://img.shields.io/badge/Three.js-3D%20Viz-blue)
![Vite](https://img.shields.io/badge/Vite-Ready-646cff)
![Algorithms](https://img.shields.io/badge/Algorithms-35+-9cf)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **35+ Sorting Algorithms** across 8 categories (Quadratic, Sub-quadratic, Log-linear, Hybrid, Non-comparison, Parallel/network, and "For fun" curiosities)
- **Race Mode** — run any two algorithms head-to-head on identical input and see which finishes with fewer operations
- **13 Input Presets** — random, sorted, reversed, nearly-sorted, few-unique, pipe-organ, sawtooth, gaussian, "median-of-3 killer" (pathological input for quicksort variants), and more
- **Interactive 3D Visualization** powered by three.js with:
  - Color-coded operations (compare = yellow, swap/write = red, sorted = green, pivot = purple)
  - Range dimming to show active partitions
  - Floating value labels on active bars
- **Procedural Audio** — pitch mapped to element values with a dynamics compressor for clean sound even at high speeds; stereo panning in Race mode
- **Live Pseudocode** with real-time line highlighting as the algorithm executes
- **Detailed Statistics** — comparisons, writes, and a "this run vs theoretical worst case" ratio on completion
- **Shareable URLs** — the exact algorithm, preset, size, and random seed are encoded in the hash (perfect for sharing interesting cases)
- **Full Keyboard Control** and step-by-step execution
- Fully responsive and works in any modern browser (best experience on desktop)

## 🚀 Live Demo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TriMPham98/sorting-algorithm-visualizer)

**[Live Demo](https://sorting-algorithm-visualizer.vercel.app)**

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Development

```bash
git clone https://github.com/TriMPham98/sorting-algorithm-visualizer.git
cd sorting-algorithm-visualizer

npm install
npm run dev
```

Open the localhost URL shown in the terminal, then:

1. Click **New Array** (or press `N` / `R`)
2. Pick an algorithm (or press `1`–`9` for the first nine)
3. Hit **Play** (or press `Space`)

## 🎮 Controls

| Control      | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| Mode         | Free (single view) or Race (two algorithms side-by-side)                    |
| Algorithm    | Choose from 35+ methods organized by category                               |
| vs.          | Second algorithm (Race mode only)                                           |
| Input        | 13 presets — try "Median-of-3 killer" with Quick or Pdq Sort                |
| Size         | Number of elements (16–200)                                                 |
| Speed        | Steps per frame (1–50). Labels and current-op text auto-hide at high speeds |
| New Array    | Generate a fresh array (preserves current seed unless you want a new one)   |
| Play / Pause | Start, pause, or resume (Space)                                             |
| Step         | Advance a single step (S)                                                   |
| Mute         | Toggle audio without stopping the visualization (M)                         |

### Keyboard Shortcuts

| Key         | Action                              |
|-------------|-------------------------------------|
| `Space`     | Play / Pause                        |
| `S`         | Step once                           |
| `N` or `R`  | New Array (new random seed)         |
| `M`         | Toggle mute                         |
| `←` / `→`   | Speed − / +                         |
| `1` – `9`   | Select one of the first 9 algorithms|
| `?`         | Show / hide this shortcuts overlay  |

## 📚 Notable Input Presets

| Preset             | Why It's Interesting |
|--------------------|----------------------|
| **Nearly sorted**  | Best-case behavior for insertion, shell, tim, smooth, etc. |
| **Few unique**     | Stresses partition-heavy algorithms; good for counting/radix. |
| **Pipe organ**     | Rises then falls — exposes asymmetry in some quicksort pivots. |
| **Sawtooth**       | Multiple ascending runs — natural merge sort / timsort love this. |
| **Gaussian**       | Normal distribution around the middle — realistic "real world" data. |
| **Median-of-3 killer** | McIlroy-style adversarial input that makes naive median-of-3 quicksort hit ~O(n²) compares. Watch Pdq Sort or Intro Sort defend against it. |
| **All equal** / **Two values** | Extreme duplicate cases that expose unstable or comparison-counting behavior. |

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🧰 Tech Stack & Implementation Highlights

- **three.js** — 3D rendering with render-on-demand (zero CPU/GPU when idle)
- **Web Audio API** — Triangle oscillators + dynamics compressor (prevents harshness at high step rates) + stereo panner for Race mode
- **Generator-based step model** — Every algorithm is a clean ES6 generator that yields `{ type: 'compare'|'swap'|'overwrite'|'mark-sorted'|'range'|'pivot'|'heap-end', ... }` objects. The animator consumes them at a controllable rate.
- **Seeded PRNG** (mulberry32) — Every array is reproducible from the URL hash.
- **Carefully tuned camera math** — Perspective view that always frames the bars correctly regardless of count or aspect ratio.

## 📁 Project Structure

```
sorting-algorithm-visualizer/
├── src/
│   ├── algorithms/      # 35+ generators + pseudocode + metadata
│   │   └── index.js     # Single source of truth (categories, worst-case formulas, etc.)
│   ├── main.js          # Orchestration, race logic, array presets, keyboard
│   ├── animator.js      # Step pump, counters, highlight lifecycle
│   ├── bars.js          # Three.js meshes + colors + range/pivot/heap dimming
│   ├── scene.js         # Camera, lights, floor/grid, render-on-demand loop
│   ├── audio.js         # Oscillator pool + compressor + panning wrapper
│   ├── labels.js        # DOM value labels projected from 3D
│   ├── ui.js            # All DOM wiring and state reflection
│   ├── urlState.js      # Hash-based persistence (algo + preset + size + seed)
│   └── prng.js          # mulberry32 + seed helper
├── index.html           # Single-file UI (all CSS inline)
├── vite.config.js
└── package.json
```

## 🤝 Contributing

Pull requests are very welcome!

Great areas to contribute:
- New interesting algorithms (especially with good visual or audio properties)
- Additional input presets that expose interesting algorithmic behavior
- Visualization improvements (different geometries, particle effects on swaps, better lighting)
- Accessibility / mobile experience
- Performance (instanced meshes to comfortably go past n=200)

Please keep the existing generator step contract so the animator, highlighting, and audio continue to work for free.

## 📄 License

MIT © Tri Pham

---

⭐ Star this repo if you found it helpful! If you use it for teaching algorithms, I'd love to hear about it.