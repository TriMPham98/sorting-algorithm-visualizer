export const pseudocode = [
  'while not sorted(a):',
  '  shuffle a',
  '',
  '// sorted(a):',
  '//   for i = 0 to n-2:',
  '//     if a[i] > a[i+1]: return false',
  '//   return true',
];

// The joke sort. Has no real termination guarantee — expected runtime is
// O(n · n!), which is already older than the universe for n ≈ 20. We let it
// run forever; the user is expected to press "New Array" when bored.
export function* bogoSort(arr) {
  const n = arr.length;
  if (n <= 1) {
    if (n === 1) yield { type: 'mark-sorted', i: 0 };
    return;
  }
  while (true) {
    // is-sorted check (visible compares).
    let sorted = true;
    for (let i = 0; i < n - 1; i++) {
      yield { type: 'compare', i, j: i + 1, line: 5 };
      if (arr[i] > arr[i + 1]) { sorted = false; break; }
    }
    if (sorted) break;
    // Fisher-Yates shuffle.
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      if (i !== j) {
        const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        yield { type: 'swap', i, j, line: 1 };
      }
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
