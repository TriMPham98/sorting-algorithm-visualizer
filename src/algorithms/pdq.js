export const pseudocode = [
  'pdq(lo, hi, depth):',
  '  if hi - lo < 24: insertion-sort',
  '  if depth == 0: heap-sort fallback',
  '  pivot = median-of-3(lo, mid, hi)',
  '  partition around pivot',
  '  recurse smaller half, loop larger',
];

const SMALL = 24;

export function* pdqSort(arr) {
  const n = arr.length;
  if (n <= 1) {
    if (n === 1) yield { type: 'mark-sorted', i: 0 };
    return;
  }
  const maxDepth = 2 * Math.floor(Math.log2(n));
  yield* pdqRange(arr, 0, n - 1, maxDepth);
  yield { type: 'range', lo: null, hi: null };
  yield { type: 'pivot', i: null };
  yield { type: 'heap-end', end: null };
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}

function* pdqRange(arr, lo, hi, depth) {
  while (hi - lo + 1 > SMALL) {
    yield { type: 'range', lo, hi, role: 'partition' };
    if (depth === 0) {
      yield* heapRange(arr, lo, hi);
      return;
    }
    depth--;
    yield* medianOf3(arr, lo, hi);
    yield { type: 'pivot', i: hi };
    const p = yield* partition(arr, lo, hi);
    yield { type: 'pivot', i: null };
    yield { type: 'mark-sorted', i: p };
    if (p - lo < hi - p) {
      yield* pdqRange(arr, lo, p - 1, depth);
      lo = p + 1;
    } else {
      yield* pdqRange(arr, p + 1, hi, depth);
      hi = p - 1;
    }
  }
  if (lo < hi) {
    yield { type: 'range', lo, hi, role: 'insertion' };
    yield* insertionRange(arr, lo, hi);
  }
  if (lo === hi) yield { type: 'mark-sorted', i: lo };
}

// Median-of-three: sort a[lo] <= a[mid] <= a[hi], then swap median to hi
// so partition() picks it as the pivot.
function* medianOf3(arr, lo, hi) {
  const mid = (lo + hi) >> 1;
  yield { type: 'compare', i: lo, j: mid, line: 3 };
  if (arr[lo] > arr[mid]) {
    const t = arr[lo]; arr[lo] = arr[mid]; arr[mid] = t;
    yield { type: 'swap', i: lo, j: mid, line: 3 };
  }
  yield { type: 'compare', i: lo, j: hi, line: 3 };
  if (arr[lo] > arr[hi]) {
    const t = arr[lo]; arr[lo] = arr[hi]; arr[hi] = t;
    yield { type: 'swap', i: lo, j: hi, line: 3 };
  }
  yield { type: 'compare', i: mid, j: hi, line: 3 };
  if (arr[mid] > arr[hi]) {
    const t = arr[mid]; arr[mid] = arr[hi]; arr[hi] = t;
    yield { type: 'swap', i: mid, j: hi, line: 3 };
  }
  // Place median at hi for Lomuto-style partition.
  const t = arr[mid]; arr[mid] = arr[hi]; arr[hi] = t;
  yield { type: 'swap', i: mid, j: hi, line: 3 };
}

function* partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    yield { type: 'compare', i: j, j: hi, line: 4 };
    if (arr[j] <= pivot) {
      i++;
      if (i !== j) {
        const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        yield { type: 'swap', i, j, line: 4 };
      }
    }
  }
  if (i + 1 !== hi) {
    const t = arr[i + 1]; arr[i + 1] = arr[hi]; arr[hi] = t;
    yield { type: 'swap', i: i + 1, j: hi, line: 4 };
  }
  return i + 1;
}

function* insertionRange(arr, lo, hi) {
  for (let i = lo + 1; i <= hi; i++) {
    let j = i;
    while (j > lo) {
      yield { type: 'compare', i: j - 1, j, line: 1 };
      if (arr[j - 1] > arr[j]) {
        const t = arr[j]; arr[j] = arr[j - 1]; arr[j - 1] = t;
        yield { type: 'swap', i: j - 1, j, line: 1 };
        j--;
      } else break;
    }
  }
}

function* heapRange(arr, lo, hi) {
  const len = hi - lo + 1;
  for (let i = (len >> 1) - 1; i >= 0; i--) yield* siftDown(arr, lo + i, lo, hi);
  for (let end = hi; end > lo; end--) {
    const t = arr[lo]; arr[lo] = arr[end]; arr[end] = t;
    yield { type: 'swap', i: lo, j: end, line: 2 };
    yield* siftDown(arr, lo, lo, end - 1);
  }
}

function* siftDown(arr, root, lo, hi) {
  let r = root;
  while (true) {
    const leftOff = 2 * (r - lo) + 1;
    const left = lo + leftOff;
    const right = left + 1;
    let largest = r;
    if (left <= hi) {
      yield { type: 'compare', i: largest, j: left, line: 2 };
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right <= hi) {
      yield { type: 'compare', i: largest, j: right, line: 2 };
      if (arr[right] > arr[largest]) largest = right;
    }
    if (largest === r) break;
    const t = arr[r]; arr[r] = arr[largest]; arr[largest] = t;
    yield { type: 'swap', i: r, j: largest, line: 2 };
    r = largest;
  }
}
