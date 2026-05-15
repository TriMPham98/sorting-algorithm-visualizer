import { bubbleSort,    pseudocode as bubblePC    } from './bubble.js';
import { insertionSort, pseudocode as insertionPC } from './insertion.js';
import { selectionSort, pseudocode as selectionPC } from './selection.js';
import { mergeSort,     pseudocode as mergePC     } from './merge.js';
import { quickSort,     pseudocode as quickPC     } from './quick.js';
import { heapSort,      pseudocode as heapPC      } from './heap.js';
import { shellSort,     pseudocode as shellPC     } from './shell.js';
import { cocktailSort,  pseudocode as cocktailPC  } from './cocktail.js';
import { countingSort,  pseudocode as countingPC  } from './counting.js';
import { radixSort,     pseudocode as radixPC     } from './radix.js';
import { timSort,       pseudocode as timPC       } from './tim.js';
import { introSort,     pseudocode as introPC     } from './intro.js';
import { bogoSort,      pseudocode as bogoPC      } from './bogo.js';

const nSquaredOverTwo = (n) => Math.round(n * (n - 1) / 2);
const nLogN = (n) => Math.round(n * Math.log2(Math.max(2, n)));

// Ordered by complexity-class group. The `category` field drives the
// <optgroup> labels in the dropdown.
export const algorithms = [
  // ---- Quadratic O(n²) ---------------------------------------------------
  {
    id: 'insertion', name: 'Insertion Sort', category: 'Quadratic O(n²)',
    fn: insertionSort, pseudocode: insertionPC,
    info: {
      best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: true, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Builds a sorted prefix by repeatedly taking the next element and sliding it left into place. Cheap on nearly-sorted input (close to O(n)), but quadratic on random data. Real-world use: stdlibs (TimSort, V8) fall back to insertion for small subarrays because its constant factors beat the asymptotically faster sorts when n is tiny.',
  },
  {
    id: 'selection', name: 'Selection Sort', category: 'Quadratic O(n²)',
    fn: selectionSort, pseudocode: selectionPC,
    info: {
      best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Scans the unsorted suffix for the minimum, swaps it into place, repeat. Always Θ(n²) — even on sorted input it still scans everything. Its one virtue: minimum number of writes (n−1), useful when writes are expensive (e.g., flash memory).',
  },
  {
    id: 'bubble', name: 'Bubble Sort', category: 'Quadratic O(n²)',
    fn: bubbleSort, pseudocode: bubblePC,
    info: {
      best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: true, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Repeatedly walks the array, swapping any adjacent pair that\'s out of order. After each pass the largest unsorted element "bubbles" to its final position. Almost never used in practice — it\'s here as the canonical "naive sort" and a baseline for comparison.',
  },
  {
    id: 'cocktail', name: 'Cocktail Sort', category: 'Quadratic O(n²)',
    fn: cocktailSort, pseudocode: cocktailPC,
    info: {
      best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: true, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Bubble sort that alternates direction each pass — forward, then backward. Handles "turtles" (small values near the end) faster than plain bubble sort because they bubble back left in one pass instead of crawling one position per outer iteration. Still O(n²); a curiosity rather than a serious tool.',
  },
  // ---- Sub-quadratic ----------------------------------------------------
  {
    id: 'shell', name: 'Shell Sort', category: 'Sub-quadratic',
    fn: shellSort, pseudocode: shellPC,
    info: {
      best: 'O(n log n)', average: 'O(n^1.25)', worst: 'O(n²)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Insertion sort over a decreasing sequence of "gaps" — first compare elements far apart, then closer, finally adjacent. Each gap-pass reduces inversions drastically so the final gap=1 pass has almost nothing to do. Simple to implement, no extra memory, surprisingly competitive on small inputs.',
  },
  // ---- Log-linear O(n log n) --------------------------------------------
  {
    id: 'merge', name: 'Merge Sort', category: 'Log-linear O(n log n)',
    fn: mergeSort, pseudocode: mergePC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
      stable: true, inPlace: false,
      worstCompares: nLogN, worstLabel: 'n·log₂(n)',
    },
    description: 'Divide-and-conquer: split in half, sort each half recursively, then merge the two sorted halves. Guaranteed O(n log n) and stable — preferred when worst-case behavior or stability matters (databases, external sorting on disk). Costs O(n) auxiliary space.',
  },
  {
    id: 'quick', name: 'Quick Sort', category: 'Log-linear O(n log n)',
    fn: quickSort, pseudocode: quickPC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)',
      stable: false, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Pick a pivot, partition into "≤ pivot" and "> pivot", recurse on each side. Fastest in-place sort in practice — the basis of most stdlib sorts (glibc qsort, Go, Rust\'s pdqsort). Naive pivot choice (here: last element, Lomuto) degrades to O(n²) on sorted input; production code uses median-of-three or random pivots.',
  },
  {
    id: 'heap', name: 'Heap Sort', category: 'Log-linear O(n log n)',
    fn: heapSort, pseudocode: heapPC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: (n) => 2 * nLogN(n), worstLabel: '2·n·log₂(n)',
    },
    description: 'Builds a max-heap in place, then repeatedly swaps the root (max) to the end and sifts down. Guaranteed O(n log n), constant space — Quick Sort\'s safety net when worst-case matters. Used as the fallback when Introsort\'s recursion depth exceeds a threshold.',
  },
  // ---- Hybrid (real-world) ----------------------------------------------
  {
    id: 'tim', name: 'Tim Sort', category: 'Hybrid',
    fn: timSort, pseudocode: timPC,
    info: {
      best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
      stable: true, inPlace: false,
      worstCompares: nLogN, worstLabel: 'n·log₂(n)',
    },
    description: 'Hybrid of insertion sort and merge sort. Splits the array into fixed-size "runs" (16 here), insertion-sorts each, then bottom-up merges runs of doubling size. Stable, O(n) on already-sorted input, O(n log n) worst case. The default sort in Python (sorted / list.sort) and Java\'s Arrays.sort for objects — wins in practice because real data is rarely random.',
  },
  {
    id: 'intro', name: 'Intro Sort', category: 'Hybrid',
    fn: introSort, pseudocode: introPC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(log n)',
      stable: false, inPlace: true,
      worstCompares: (n) => 2 * nLogN(n), worstLabel: '~2·n·log₂(n)',
    },
    description: 'Quicksort + heapsort + insertion sort. Runs quicksort, but if recursion depth exceeds 2·log₂(n) it bails out to heapsort to dodge quicksort\'s O(n²) worst case; for partitions of size ≤ 16 it switches to insertion sort. Guaranteed O(n log n), in-place, fast in practice — used by C++ std::sort and .NET\'s Array.Sort.',
  },
  // ---- Non-comparison ----------------------------------------------------
  {
    id: 'counting', name: 'Counting Sort', category: 'Non-comparison',
    fn: countingSort, pseudocode: countingPC,
    info: {
      best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n+k)', space: 'O(n+k)',
      stable: true, inPlace: false,
      worstCompares: (n) => 2 * n, worstLabel: '2n (reads)',
    },
    description: 'Not a comparison sort — counts occurrences of each value, then writes them back in order. Linear time O(n+k) where k = max value, breaking the n·log(n) lower bound of comparison sorts. Used as the subroutine inside radix sort. Caveat in this viz: counting buckets are internal and not drawn — you see only the array reads and the final stable write-back.',
  },
  {
    id: 'radix', name: 'Radix Sort', category: 'Non-comparison',
    fn: radixSort, pseudocode: radixPC,
    info: {
      best: 'O(d(n+b))', average: 'O(d(n+b))', worst: 'O(d(n+b))', space: 'O(n+b)',
      stable: true, inPlace: false,
      worstCompares: (n) => 2 * n * 3, worstLabel: '~2nd (d≈3 digits)',
    },
    description: 'LSD radix sort: stable counting sort on the ones digit, then tens, then hundreds, etc. — d passes for d-digit numbers. Total work O(d·(n+b)) where b = base (10 here). Used in places where keys are bounded-width (integers, fixed-length strings); legendary for being fast on real data despite the unfamiliar shape. Caveat: digit buckets are internal and not drawn.',
  },
  // ---- For fun -----------------------------------------------------------
  {
    id: 'bogo', name: 'Bogo Sort', category: 'For fun',
    fn: bogoSort, pseudocode: bogoPC,
    info: {
      best: 'O(n)', average: 'O(n · n!)', worst: 'O(∞)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: (n) => n, worstLabel: 'n (best case — pray)',
    },
    description: 'The joke sort. Shuffles the array, checks if sorted, repeats. Expected work O(n · n!) — for n=12 that\'s ~6 billion shuffles; for n=20 it\'s longer than the age of the universe. Run it at n ≤ 8 for entertainment; anything larger will not finish in your lifetime. Press New Array to bail.',
  },
];

export function getAlgorithm(id) {
  return algorithms.find(a => a.id === id) || algorithms[0];
}
