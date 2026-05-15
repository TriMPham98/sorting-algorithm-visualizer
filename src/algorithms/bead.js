export const pseudocode = [
  '// Gravity / abacus sort',
  'reset bars to 0',
  'for row = 1 to max:',
  '  count beads in this row across all bars',
  '  push that many beads into the rightmost columns',
];

// Gravity / abacus sort. Each bar is a stack of beads on a rod; let beads
// fall under gravity until they pile up in the rightmost columns — the
// settled heights are the sorted values. Only works for positive integers.
export function* beadSort(arr) {
  const n = arr.length;
  if (n === 0) return;
  const original = arr.slice();
  let max = 0;
  for (let i = 0; i < n; i++) if (original[i] > max) max = original[i];
  // Zero out bars first (visual "release").
  for (let i = 0; i < n; i++) {
    arr[i] = 0;
    yield { type: 'overwrite', i, value: 0, line: 1 };
  }
  // For each row of beads, count and re-place into rightmost columns.
  for (let row = 1; row <= max; row++) {
    let count = 0;
    for (let i = 0; i < n; i++) {
      yield { type: 'compare', i, j: i, line: 3 };
      if (original[i] >= row) count++;
    }
    for (let i = n - count; i < n; i++) {
      arr[i] += 1;
      yield { type: 'overwrite', i, value: arr[i], line: 4 };
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
