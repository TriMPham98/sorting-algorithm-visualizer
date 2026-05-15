export const pseudocode = [
  'slow(lo, hi):',
  '  if lo >= hi: return',
  '  mid = (lo + hi) / 2',
  '  slow(lo, mid)',
  '  slow(mid+1, hi)',
  '  if a[mid] > a[hi]: swap',
  '  slow(lo, hi - 1)',
];

// "Multiply and surrender" — the anti-divide-and-conquer.
// Runtime is roughly O(n^(log n / 2)). Do not run at large n.
export function* slowSort(arr) {
  const n = arr.length;
  if (n > 1) yield* slow(arr, 0, n - 1);
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}

function* slow(arr, lo, hi) {
  if (lo >= hi) return;
  const mid = (lo + hi) >> 1;
  yield* slow(arr, lo, mid);
  yield* slow(arr, mid + 1, hi);
  yield { type: 'compare', i: mid, j: hi, line: 5 };
  if (arr[mid] > arr[hi]) {
    const t = arr[mid]; arr[mid] = arr[hi]; arr[hi] = t;
    yield { type: 'swap', i: mid, j: hi, line: 5 };
  }
  yield* slow(arr, lo, hi - 1);
}
