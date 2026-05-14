export function* bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      yield { type: 'compare', i: j, j: j + 1 };
      if (arr[j] > arr[j + 1]) {
        const t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
        yield { type: 'swap', i: j, j: j + 1 };
        swapped = true;
      }
    }
    yield { type: 'mark-sorted', i: n - 1 - i };
    if (!swapped) {
      for (let k = n - 2 - i; k >= 0; k--) yield { type: 'mark-sorted', i: k };
      return;
    }
  }
  yield { type: 'mark-sorted', i: 0 };
}
