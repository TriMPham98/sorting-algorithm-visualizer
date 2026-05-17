# Sorting Algorithm Visualizer

A beautiful browser-based 3D visualization of classic sorting algorithms with real-time procedurally generated audio. Built with [three.js](https://threejs.org/) and the Web Audio API.

![Sorting Visualizer](https://img.shields.io/badge/Three.js-3D%20Viz-blue)
![Vite](https://img.shields.io/badge/Vite-Ready-646cff)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **6 Sorting Algorithms**: Insertion, Bubble, Selection, Merge, Quick, and Heap Sort
- **Interactive 3D Visualization** powered by three.js
- **Procedural Audio** — pitch mapped to element values for a satisfying ascending sweep when sorted
- **Real-time Controls**:
  - Adjustable array size (16–200)
  - Playback speed control
  - Shuffle / Reset
  - Play / Pause / Mute
- Fully responsive and works in any modern browser

## 🚀 Live Demo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TriMPham98/sorting-algorithm-visualizer)

[Live Demo](https://sorting-algorithm-visualizer.vercel.app) *(coming soon after first deploy)*

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

1. Click **Shuffle**
2. Select an algorithm
3. Hit **Play**

## 🎮 Controls

| Control     | Description                              |
|-------------|------------------------------------------|
| Algorithm   | Choose from 6 different sorting methods  |
| Size        | Number of elements (16–200)              |
| Speed       | Steps per frame (1–50)                   |
| Shuffle     | Generate a new random array              |
| Play/Pause  | Start, pause, or resume the animation    |
| Mute        | Toggle audio without stopping the viz    |
| Reset       | Return to initial state                  |

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🧰 Tech Stack

- **three.js** — 3D rendering
- **Vite** — Fast build tooling
- **Web Audio API** — Real-time sound synthesis

## 📁 Project Structure

```
sorting-algorithm-visualizer/
├── src/               # Core visualization logic
├── index.html
├── vite.config.js
└── package.json
```

## 🤝 Contributing

Pull requests are welcome! Feel free to add new algorithms, improve the visuals, or enhance the audio experience.

## 📄 License

MIT © Tri Pham

---

⭐ Star this repo if you found it helpful!