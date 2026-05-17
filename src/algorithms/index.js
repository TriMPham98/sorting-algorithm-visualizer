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
import { pancakeSort,   pseudocode as pancakePC   } from './pancake.js';
import { combSort,      pseudocode as combPC      } from './comb.js';
import { cycleSort,     pseudocode as cyclePC     } from './cycle.js';
import { gnomeSort,     pseudocode as gnomePC     } from './gnome.js';
import { bitonicSort,   pseudocode as bitonicPC   } from './bitonic.js';
import { pdqSort,       pseudocode as pdqPC       } from './pdq.js';
import { blockSort,     pseudocode as blockPC     } from './block.js';
import { stoogeSort,    pseudocode as stoogePC    } from './stooge.js';
import { slowSort,      pseudocode as slowPC      } from './slow.js';
import { beadSort,      pseudocode as beadPC      } from './bead.js';
import { bucketSort,    pseudocode as bucketPC    } from './bucket.js';
import { pigeonholeSort, pseudocode as pigeonholePC } from './pigeonhole.js';
import { flashSort,     pseudocode as flashPC     } from './flashsort.js';
import { treeSort,      pseudocode as treePC      } from './tree.js';
import { smoothSort,    pseudocode as smoothPC    } from './smooth.js';
import { tournamentSort, pseudocode as tournamentPC } from './tournament.js';
import { oddEvenSort,   pseudocode as oddEvenPC   } from './oddeven.js';
import { batcherSort,   pseudocode as batcherPC   } from './batcher.js';
import { patienceSort,  pseudocode as patiencePC  } from './patience.js';
import { strandSort,    pseudocode as strandPC    } from './strand.js';
import { librarySort,   pseudocode as libraryPC   } from './library.js';
import { sleepSort,     pseudocode as sleepPC     } from './sleep.js';

const nSquaredOverTwo = (n) => Math.round(n * (n - 1) / 2);
const nLogN = (n) => Math.round(n * Math.log2(Math.max(2, n)));
const nLogSquared = (n) => Math.round(n * Math.log2(Math.max(2, n)) ** 2);

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
  {
    id: 'gnome', name: 'Gnome Sort', category: 'Quadratic O(n²)',
    fn: gnomeSort, pseudocode: gnomePC,
    info: {
      best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: true, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Insertion sort with swaps instead of shifts. The gnome walks: if the current pair is in order, step forward; otherwise swap and step back. Notable for being expressible in a single while loop with no nested iteration — algorithmic minimalism. Same Θ(n²) behavior as insertion sort.',
  },
  {
    id: 'pancake', name: 'Pancake Sort', category: 'Quadratic O(n²)',
    fn: pancakeSort, pseudocode: pancakePC,
    info: {
      best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Restricted operation set — the only allowed move is "flip a prefix of the array end-over-end." Each pass: find max in the unsorted prefix, flip it to the front, then flip the whole prefix to drop it into place. Famous in CS folklore: Bill Gates published a paper on the upper bound while an undergrad at Harvard.',
  },
  {
    id: 'cycle', name: 'Cycle Sort', category: 'Quadratic O(n²)',
    fn: cycleSort, pseudocode: cyclePC,
    info: {
      best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Theoretically optimal in writes: ≤ n total memory writes — every element is placed at its final position exactly once. For each cycle, count smaller elements to find the destination, then rotate the cycle. Useful when writes are far more expensive than reads (EEPROM, write-limited flash, immutable storage).',
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
  {
    id: 'comb', name: 'Comb Sort', category: 'Sub-quadratic',
    fn: combSort, pseudocode: combPC,
    info: {
      best: 'O(n log n)', average: 'O(n²/2^p)', worst: 'O(n²)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Bubble sort with a shrinking gap (divide by ~1.3 each pass). Far-apart compares evict "turtle" elements that doom plain bubble sort. Once gap reaches 1 and a full pass produces no swaps, the array is sorted. Empirically much faster than bubble sort on random data despite the matching worst case.',
  },
  {
    id: 'library', name: 'Library Sort', category: 'Sub-quadratic',
    fn: librarySort, pseudocode: libraryPC,
    info: {
      best: 'O(n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(n)',
      stable: false, inPlace: false,
      worstCompares: nLogN, worstLabel: 'n·log₂(n)',
    },
    description: 'Insertion sort with breathing room: the working array is kept padded with empty gaps so a new element usually only shifts a handful of neighbours before hitting a slot. Periodic rebalancing re-spreads the gaps. With high probability the gaps keep insertions short, giving O(n log n) average — a theoretical bridge between insertion sort and the n·log(n) class. Caveat: the gapped buffer is internal, so the visualizer shows the search comparisons and the final compacted write-back.',
  },
  {
    id: 'strand', name: 'Strand Sort', category: 'Sub-quadratic',
    fn: strandSort, pseudocode: strandPC,
    info: {
      best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(n)',
      stable: true, inPlace: false,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Repeatedly pulls the next rising run ("strand") out of the input and merges it into a growing sorted result. O(n) on already-sorted data (one strand grabs everything), O(n²) when the input keeps alternating. Conceptually a relative of natural merge sort. The input/result lists are internal, so the viz shows extraction/merge comparisons then the final write-back.',
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
  {
    id: 'block', name: 'Block Sort', category: 'Log-linear O(n log n)',
    fn: blockSort, pseudocode: blockPC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(1)',
      stable: true, inPlace: true,
      worstCompares: nLogN, worstLabel: 'n·log₂(n)',
    },
    description: 'Stable, in-place merge sort. Full block sort (WikiSort) uses an internal buffer block + sub-block rotations to achieve true O(n log n) with O(1) extra memory — the only sort here that\'s simultaneously stable AND in-place. This visualizer ships a simplified version: recursive merge sort with shift-based in-place merging, so each merge is O(n²) (correct, just not asymptotically optimal).',
  },
  {
    id: 'tree', name: 'Tree Sort', category: 'Log-linear O(n log n)',
    fn: treeSort, pseudocode: treePC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(n)',
      stable: true, inPlace: false,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Insert every element into a binary search tree, then read it back with an in-order traversal. Average O(n log n), but a naive (unbalanced) BST degenerates to a linked list on already-sorted input — O(n²). Self-balancing variants (red-black / AVL) restore the guarantee. Shows the deep equivalence between sorting and the search-tree data structure.',
  },
  {
    id: 'tournament', name: 'Tournament Sort', category: 'Log-linear O(n log n)',
    fn: tournamentSort, pseudocode: tournamentPC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
      stable: true, inPlace: false,
      worstCompares: nLogN, worstLabel: 'n·log₂(n)',
    },
    description: 'Selection sort where "find the minimum" is a single-elimination tournament. Build a winner tree once; after emitting each champion, only the O(log n) matches along its path need replaying. The conceptual ancestor of heapsort, and the classic basis of external/replacement-selection merge sort for data too big for RAM.',
  },
  {
    id: 'smooth', name: 'Smooth Sort', category: 'Log-linear O(n log n)',
    fn: smoothSort, pseudocode: smoothPC,
    info: {
      best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: (n) => 2 * nLogN(n), worstLabel: '~2·n·log₂(n)',
    },
    description: 'Dijkstra\'s heapsort variant (EWD796a) built on a forest of Leonardo heaps instead of one binary heap. Adaptive: O(n) on already-sorted input, degrading gracefully to O(n log n) as disorder increases — the in-place, constant-space answer to "heapsort but adaptive." Famously intricate to implement correctly; this is the Hertel transliteration.',
  },
  {
    id: 'patience', name: 'Patience Sort', category: 'Log-linear O(n log n)',
    fn: patienceSort, pseudocode: patiencePC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(n)',
      stable: false, inPlace: false,
      worstCompares: nSquaredOverTwo, worstLabel: '~n·(#piles)',
    },
    description: 'Modelled on the card game: deal each value onto the leftmost pile whose top is no smaller, then k-way merge the pile tops. The number of piles equals the length of the longest increasing subsequence, so the dealing phase solves LIS as a byproduct. With a heap for the merge it is O(n log n); this viz uses a linear pile scan for clarity.',
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
  {
    id: 'pdq', name: 'Pdq Sort', category: 'Hybrid',
    fn: pdqSort, pseudocode: pdqPC,
    info: {
      best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(log n)',
      stable: false, inPlace: true,
      worstCompares: (n) => 2 * nLogN(n), worstLabel: '~2·n·log₂(n)',
    },
    description: 'Pattern-defeating quicksort. Like introsort but smarter: median-of-three pivot, insertion-sort cutoff at 24, and a heapsort fallback when depth exceeds 2·log₂(n). Production-grade variants (Rust\'s std::sort_unstable, C++ 17\'s std::sort in some libs) also detect already-sorted patterns and shuffle pathological inputs. Beats introsort on real-world data.',
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
  {
    id: 'bucket', name: 'Bucket Sort', category: 'Non-comparison',
    fn: bucketSort, pseudocode: bucketPC,
    info: {
      best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n²)', space: 'O(n+k)',
      stable: true, inPlace: false,
      worstCompares: (n) => 2 * n, worstLabel: '~2n (scatter+gather)',
    },
    description: 'Scatter elements into ⌈√n⌉ value-range buckets, sort each bucket (insertion sort here), then concatenate. Linear-ish O(n+k) when the data is uniformly distributed so buckets stay small; degrades toward O(n²) if everything lands in one bucket. The distribution-sort cousin of counting/radix. Caveat: buckets are internal — you see the scatter reads and the ordered write-back.',
  },
  {
    id: 'pigeonhole', name: 'Pigeonhole Sort', category: 'Non-comparison',
    fn: pigeonholeSort, pseudocode: pigeonholePC,
    info: {
      best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n+k)', space: 'O(n+k)',
      stable: true, inPlace: false,
      worstCompares: (n) => 2 * n, worstLabel: '2n (reads)',
    },
    description: 'One "hole" per distinct value in the range; drop each element into its hole, then walk the holes in order. Like counting sort, but it physically moves the elements rather than re-deriving them from tallies. Only practical when the value range k is close to n. Caveat: holes are internal — the viz shows the reads and the ordered write-back.',
  },
  {
    id: 'flash', name: 'Flash Sort', category: 'Non-comparison',
    fn: flashSort, pseudocode: flashPC,
    info: {
      best: 'O(n)', average: 'O(n)', worst: 'O(n²)', space: 'O(n)',
      stable: false, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Neubert\'s distribution sort. Classify elements into ~0.45n value classes, prefix-sum the class boundaries, then permute every element into its class with a single in-place cycle pass, finishing with a short insertion sort. ~O(n) on uniformly distributed data and nearly in-place — but sensitive to distribution (skewed data pushes it toward O(n²)).',
  },
  // ---- Parallel / network -----------------------------------------------
  {
    id: 'bitonic', name: 'Bitonic Sort', category: 'Parallel / network',
    fn: bitonicSort, pseudocode: bitonicPC,
    info: {
      best: 'O(n log²n)', average: 'O(n log²n)', worst: 'O(n log²n)', space: 'O(log n)',
      stable: false, inPlace: true,
      worstCompares: nLogSquared, worstLabel: 'n·log²(n)',
    },
    description: 'A sorting network: a fixed lattice of compare-exchange operations whose pattern is independent of the input data. Each layer of compares is data-parallel — perfect for GPU/SIMD (used in CUDA/OpenCL sort primitives). O(n log²n) work; more compares than mergesort but extremely amenable to hardware parallelism.',
  },
  {
    id: 'oddeven', name: 'Odd-Even Sort', category: 'Parallel / network',
    fn: oddEvenSort, pseudocode: oddEvenPC,
    info: {
      best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
      stable: true, inPlace: true,
      worstCompares: nSquaredOverTwo, worstLabel: 'n(n−1)/2',
    },
    description: 'Brick sort: alternate "odd" passes comparing pairs (1,2)(3,4)… with "even" passes (0,1)(2,3)…, swapping any out-of-order pair, until a clean pass. Every compare-exchange in a phase is independent, so on a parallel machine a phase costs O(1) and the whole sort is O(n) depth. Serially it is just bubble sort\'s O(n²) cousin.',
  },
  {
    id: 'batcher', name: 'Odd-Even Merge Sort', category: 'Parallel / network',
    fn: batcherSort, pseudocode: batcherPC,
    info: {
      best: 'O(n log²n)', average: 'O(n log²n)', worst: 'O(n log²n)', space: 'O(1)',
      stable: false, inPlace: true,
      worstCompares: nLogSquared, worstLabel: 'n·log²(n)',
    },
    description: 'Batcher\'s odd–even merge sort: a data-independent sorting network, like bitonic, but using a different recursive merge. Same O(n log²n) work and O(log²n) depth, generally with fewer comparators than bitonic. The iterative form shown here handles any n, not just powers of two. A staple of GPU/FPGA and oblivious (data-independent) sorting.',
  },
  // ---- For fun -----------------------------------------------------------
  {
    id: 'stooge', name: 'Stooge Sort', category: 'For fun',
    fn: stoogeSort, pseudocode: stoogePC,
    info: {
      best: 'O(n^2.71)', average: 'O(n^2.71)', worst: 'O(n^2.71)', space: 'O(log n)',
      stable: false, inPlace: true,
      worstCompares: (n) => Math.round(Math.pow(n, 2.71)), worstLabel: 'n^2.71',
    },
    description: 'Compares ends and swaps if out of order, then recursively sorts first 2/3, last 2/3, first 2/3 again. The three overlapping recursive calls give a runtime of O(n^(log 3 / log 1.5)) ≈ O(n^2.71) — markedly slower than insertion sort. A canonical example of "what not to do" in algorithm design.',
  },
  {
    id: 'slow', name: 'Slow Sort', category: 'For fun',
    fn: slowSort, pseudocode: slowPC,
    info: {
      best: 'O(n^(log n/2))', average: 'O(n^(log n/2))', worst: 'O(n^(log n/2))', space: 'O(n)',
      stable: false, inPlace: true,
      worstCompares: (n) => Math.round(Math.pow(n, Math.log2(Math.max(2, n)) / 2)), worstLabel: 'n^(log₂n / 2)',
    },
    description: '"Multiply and surrender" — the anti-divide-and-conquer. Recursively sort both halves, place the larger of the two midpoints at the end, then recursively sort everything except that last element. Famous from a tongue-in-cheek 1986 paper. Do not run it at n > 30 unless you have time on your hands.',
  },
  {
    id: 'bead', name: 'Bead Sort', category: 'For fun',
    fn: beadSort, pseudocode: beadPC,
    info: {
      best: 'O(max)', average: 'O(n·max)', worst: 'O(n·max)', space: 'O(n·max)',
      stable: false, inPlace: false,
      worstCompares: (n) => 2 * n * n, worstLabel: '~n · max',
    },
    description: 'Gravity / abacus sort. Picture each bar as a stack of beads on a rod; let beads "fall" under gravity, then read the settled heights. Conceptually elegant — sorting via physics — but only works for positive integers and the count of operations scales with the values, not just n. From a 2002 paper as a theoretical curiosity, occasionally implemented in analog/optical hardware.',
  },
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
  {
    id: 'sleep', name: 'Sleep Sort', category: 'For fun',
    fn: sleepSort, pseudocode: sleepPC,
    info: {
      best: 'O(n + r)', average: 'O(n + r)', worst: 'O(n + r)', space: 'O(n)',
      stable: true, inPlace: false,
      worstCompares: (n) => n, worstLabel: 'n·range (sim)',
    },
    description: 'The concurrency joke sort: spawn one thread per element that sleeps for a time proportional to its value, then prints it — smaller values wake first. Hilariously dependent on the OS scheduler and useless for close or large values. Simulated here with a deterministic virtual clock (r = value range) so it always sorts; the timers are conceptual, so the viz shows the clock scan then the wake-order write-back.',
  },
];

export function getAlgorithm(id) {
  return algorithms.find(a => a.id === id) || algorithms[0];
}
