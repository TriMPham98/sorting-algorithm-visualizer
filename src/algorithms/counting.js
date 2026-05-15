export const pseudocode = [
  'count[v] = 0 for each value v',
  'for x in a: count[x] += 1',
  '// prefix sums for stable placement',
  'for v in 1..k: count[v] += count[v-1]',
  'for x in a (reversed):',
  '  output[count[x]-1] = x; count[x] -= 1',
  'copy output back into a',
];

export function* countingSort(arr) {
  const n = arr.length;
  if (n === 0) return;
  let max = arr[0];
  for (let i = 1; i < n; i++) if (arr[i] > max) max = arr[i];
  const count = new Array(max + 1).fill(0);

  // Tally — each input read flashes one bar
  for (let i = 0; i < n; i++) {
    yield { type: 'compare', i, j: i, line: 1 };
    count[arr[i]]++;
  }
  // Prefix sums (silent — no array activity to show)
  for (let v = 1; v <= max; v++) count[v] += count[v - 1];

  // Write output (stable, traversing input in reverse)
  const output = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    yield { type: 'compare', i, j: i, line: 4 };
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }
  // Apply back to a
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
    yield { type: 'overwrite', i, value: output[i], line: 6 };
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
