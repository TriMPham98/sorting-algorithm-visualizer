export const pseudocode = [
  'bitonicSort(lo, n, dir):',
  '  if n <= 1: return',
  '  m = greatestPow2LessThan(n)',
  '  bitonicSort(lo, m, !dir)',
  '  bitonicSort(lo+m, n-m, dir)',
  '  bitonicMerge(lo, n, dir)',
  '',
  'bitonicMerge: stride-compare each layer',
];

// Generalized bitonic sort that works for arbitrary n (not just powers of 2).
export function* bitonicSort(arr) {
  const n = arr.length;
  if (n > 1) yield* bitonicRange(arr, 0, n, 1);
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}

function* bitonicRange(arr, lo, len, dir) {
  if (len <= 1) return;
  const m = greatestPow2LessThan(len);
  yield* bitonicRange(arr, lo, m, 1 - dir);
  yield* bitonicRange(arr, lo + m, len - m, dir);
  yield* bitonicMerge(arr, lo, len, dir);
}

function* bitonicMerge(arr, lo, len, dir) {
  if (len <= 1) return;
  const m = greatestPow2LessThan(len);
  for (let i = lo; i < lo + len - m; i++) {
    yield { type: 'compare', i, j: i + m, line: 6 };
    // Ascending dir=1: swap if arr[i] > arr[i+m]
    // Descending dir=0: swap if arr[i] < arr[i+m]
    if ((dir === 1 && arr[i] > arr[i + m]) ||
        (dir === 0 && arr[i] < arr[i + m])) {
      const t = arr[i]; arr[i] = arr[i + m]; arr[i + m] = t;
      yield { type: 'swap', i, j: i + m, line: 6 };
    }
  }
  yield* bitonicMerge(arr, lo, m, dir);
  yield* bitonicMerge(arr, lo + m, len - m, dir);
}

function greatestPow2LessThan(n) {
  let k = 1;
  while (k < n) k <<= 1;
  return k >> 1;
}
