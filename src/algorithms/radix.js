export const pseudocode = [
  'for digit = ones, tens, hundreds, ...:',
  '  // stable counting sort on this digit',
  '  scan a, tally digit counts',
  '  prefix-sum the counts',
  '  build output by stable placement',
  '  copy output back into a',
];

export function* radixSort(arr) {
  const n = arr.length;
  if (n === 0) return;
  let max = arr[0];
  for (let i = 1; i < n; i++) if (arr[i] > max) max = arr[i];

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const count = new Array(10).fill(0);
    // Tally digits
    for (let i = 0; i < n; i++) {
      yield { type: 'compare', i, j: i, line: 2 };
      count[Math.floor(arr[i] / exp) % 10]++;
    }
    for (let d = 1; d < 10; d++) count[d] += count[d - 1];

    // Build output (stable: traverse in reverse)
    const output = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      yield { type: 'compare', i, j: i, line: 4 };
      const d = Math.floor(arr[i] / exp) % 10;
      output[count[d] - 1] = arr[i];
      count[d]--;
    }
    // Apply back
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
      yield { type: 'overwrite', i, value: output[i], line: 5 };
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
