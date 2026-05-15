import { bubbleSort,    pseudocode as bubblePC    } from './bubble.js';
import { insertionSort, pseudocode as insertionPC } from './insertion.js';
import { selectionSort, pseudocode as selectionPC } from './selection.js';
import { mergeSort,     pseudocode as mergePC     } from './merge.js';
import { quickSort,     pseudocode as quickPC     } from './quick.js';
import { heapSort,      pseudocode as heapPC      } from './heap.js';

const nSquaredOverTwo = (n) => Math.round(n * (n - 1) / 2);
const nLogN = (n) => Math.round(n * Math.log2(Math.max(2, n)));

export const algorithms = [
  {
    id: 'insertion', name: 'Insertion Sort', fn: insertionSort, pseudocode: insertionPC,
    info: {
      best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: true, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
  },
  {
    id: 'bubble', name: 'Bubble Sort', fn: bubbleSort, pseudocode: bubblePC,
    info: {
      best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: true, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
  },
  {
    id: 'selection', name: 'Selection Sort', fn: selectionSort, pseudocode: selectionPC,
    info: {
      best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
  },
  {
    id: 'merge', name: 'Merge Sort', fn: mergeSort, pseudocode: mergePC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
      stable: true, inPlace: false,
      worstCompares: nLogN, worstLabel: 'n·log₂(n)',
    },
  },
  {
    id: 'quick', name: 'Quick Sort', fn: quickSort, pseudocode: quickPC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)',
      stable: false, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
  },
  {
    id: 'heap', name: 'Heap Sort', fn: heapSort, pseudocode: heapPC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: (n) => 2 * nLogN(n), worstLabel: '2·n·log₂(n)',
    },
  },
];

export function getAlgorithm(id) {
  return algorithms.find(a => a.id === id) || algorithms[0];
}
