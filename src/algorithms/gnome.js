export const pseudocode = [
  'i = 1',
  'while i < n:',
  '  if i == 0 or a[i-1] <= a[i]: i++',
  '  else: swap a[i-1], a[i]; i--',
];

export function* gnomeSort(arr) {
  const n = arr.length;
  let i = 1;
  while (i < n) {
    if (i === 0) { i++; continue; }
    yield { type: 'compare', i: i - 1, j: i, line: 2 };
    if (arr[i - 1] <= arr[i]) {
      i++;
    } else {
      const t = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = t;
      yield { type: 'swap', i: i - 1, j: i, line: 3 };
      i--;
    }
  }
  for (let k = 0; k < n; k++) yield { type: 'mark-sorted', i: k };
}
