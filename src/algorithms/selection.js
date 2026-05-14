export function* selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', i: minIdx, j };
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      const t = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = t;
      yield { type: 'swap', i, j: minIdx };
    }
    yield { type: 'mark-sorted', i };
  }
  yield { type: 'mark-sorted', i: n - 1 };
}
