export const pseudocode = [
  'gap = n',
  'while gap > 1 or swapped:',
  '  gap = max(1, floor(gap / 1.3))',
  '  swapped = false',
  '  for i = 0 to n - gap - 1:',
  '    if a[i] > a[i+gap]:',
  '      swap; swapped = true',
];

export function* combSort(arr) {
  const n = arr.length;
  let gap = n;
  let swapped = true;
  const shrink = 1.3;
  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / shrink));
    swapped = false;
    for (let i = 0; i + gap < n; i++) {
      yield { type: 'compare', i, j: i + gap, line: 5 };
      if (arr[i] > arr[i + gap]) {
        const t = arr[i]; arr[i] = arr[i + gap]; arr[i + gap] = t;
        yield { type: 'swap', i, j: i + gap, line: 6 };
        swapped = true;
      }
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
