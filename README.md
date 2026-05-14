# Sorting Algorithm Visualizer

A browser-based 3D visualization of common sorting algorithms with procedurally-generated audio. Built with [three.js](https://threejs.org/) and the Web Audio API.

Algorithms: Insertion, Bubble, Selection, Merge, Quick, Heap.

## Run

```
npm install
npm run dev
```

Open the printed localhost URL. Click **Shuffle**, pick an algorithm, then **Play**.

## Controls

- **Algorithm** — choose one of the six sorts
- **Size** — array size (16–200)
- **Speed** — steps applied per frame (1–50)
- **Shuffle** / **Reset** — generate a new random array
- **Play / Pause** — start, pause, or resume the current sort
- **Mute** — silence audio without stopping the visualization

Pitch is mapped to the value of the element being touched, so a sorted array produces a clean ascending sweep.

## Build

```
npm run build
npm run preview
```
