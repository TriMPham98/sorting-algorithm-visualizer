import { bubbleSort } from './bubble.js';
import { insertionSort } from './insertion.js';
import { selectionSort } from './selection.js';
import { mergeSort } from './merge.js';
import { quickSort } from './quick.js';
import { heapSort } from './heap.js';

export const algorithms = [
  { id: 'insertion', name: 'Insertion Sort', fn: insertionSort },
  { id: 'bubble',    name: 'Bubble Sort',    fn: bubbleSort },
  { id: 'selection', name: 'Selection Sort', fn: selectionSort },
  { id: 'merge',     name: 'Merge Sort',     fn: mergeSort },
  { id: 'quick',     name: 'Quick Sort',     fn: quickSort },
  { id: 'heap',      name: 'Heap Sort',      fn: heapSort },
];

export function getAlgorithm(id) {
  return algorithms.find(a => a.id === id) || algorithms[0];
}
