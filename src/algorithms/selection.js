export const pseudocode = [
  'for i = 0 to n-1:',
  '  min = i',
  '  for j = i+1 to n:',
  '    if a[j] < a[min]: min = j',
  '  swap a[i], a[min]',
];

export function* selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', i: minIdx, j, line: 3 };
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      const t = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = t;
      yield { type: 'swap', i, j: minIdx, line: 4 };
    }
    yield { type: 'mark-sorted', i, line: 0 };
  }
  yield { type: 'mark-sorted', i: n - 1 };
}
