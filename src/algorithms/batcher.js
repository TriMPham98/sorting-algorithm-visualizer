export const pseudocode = [
  'for p = 1, 2, 4, … < n:',
  '  for k = p, p/2, … , 1:',
  '    for each aligned pair (i, i+k):',
  '      compare-exchange if in the same block',
];

// Batcher's odd–even merge sort: a deterministic O(n·log²n) sorting
// network whose compare-exchange pattern never depends on the data. This
// is the iterative form that works for any n (not just powers of two).
export function* batcherSort(arr) {
  const n = arr.length;
  if (n <= 1) {
    for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
    return;
  }
  // The iterative network is defined for a power-of-two size N. For
  // arbitrary n, build it for the next power of two and drop every
  // comparator that touches a padded index ≥ n (those carry +∞, so the
  // pruned network still sorts the first n elements).
  let N = 1;
  while (N < n) N *= 2;

  for (let p = 1; p < N; p *= 2) {
    for (let k = p; k >= 1; k = Math.floor(k / 2)) {
      for (let j = k % p; j + k < N; j += 2 * k) {
        for (let i = 0; i < k; i++) {
          if (Math.floor((i + j) / (2 * p)) === Math.floor((i + j + k) / (2 * p))) {
            const a = i + j, b = i + j + k;
            if (a >= n || b >= n) continue;
            yield { type: 'compare', i: a, j: b, line: 3 };
            if (arr[a] > arr[b]) {
              const t = arr[a]; arr[a] = arr[b]; arr[b] = t;
              yield { type: 'swap', i: a, j: b, line: 3 };
            }
          }
        }
      }
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
