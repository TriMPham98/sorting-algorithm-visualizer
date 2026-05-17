export const pseudocode = [
  'repeat until a full pass makes no swap:',
  '  odd phase:  compare (1,2) (3,4) (5,6) …',
  '  even phase: compare (0,1) (2,3) (4,5) …',
  '  swap any out-of-order pair',
];

// Odd–even transposition (brick) sort: the simplest parallel sorting
// network. Each phase's compare-exchanges are independent, so on real
// parallel hardware a phase is O(1); serially it is O(n²).
export function* oddEvenSort(arr) {
  const n = arr.length;
  if (n <= 1) {
    for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
    return;
  }
  let sorted = false;
  while (!sorted) {
    sorted = true;
    for (let phase = 1; phase >= 0; phase--) {
      for (let i = phase; i + 1 < n; i += 2) {
        yield { type: 'compare', i, j: i + 1, line: phase === 1 ? 1 : 2 };
        if (arr[i] > arr[i + 1]) {
          const t = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = t;
          yield { type: 'swap', i, j: i + 1, line: 3 };
          sorted = false;
        }
      }
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
