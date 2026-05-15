export const pseudocode = [
  'for i = 0 to n-1:',
  '  for j = 0 to n-1-i:',
  '    if a[j] > a[j+1]:',
  '      swap a[j], a[j+1]',
];

export function* bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      yield { type: 'compare', i: j, j: j + 1, line: 2 };
      if (arr[j] > arr[j + 1]) {
        const t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
        yield { type: 'swap', i: j, j: j + 1, line: 3 };
        swapped = true;
      }
    }
    yield { type: 'mark-sorted', i: n - 1 - i, line: 0 };
    if (!swapped) {
      for (let k = n - 2 - i; k >= 0; k--) yield { type: 'mark-sorted', i: k };
      return;
    }
  }
  yield { type: 'mark-sorted', i: 0 };
}
