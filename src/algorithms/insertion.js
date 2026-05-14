export function* insertionSort(arr) {
  const n = arr.length;
  if (n === 0) return;
  yield { type: 'mark-sorted', i: 0 };
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      yield { type: 'compare', i: j - 1, j };
      if (arr[j - 1] > arr[j]) {
        const t = arr[j]; arr[j] = arr[j - 1]; arr[j - 1] = t;
        yield { type: 'swap', i: j - 1, j };
        j--;
      } else {
        break;
      }
    }
  }
  for (let k = 0; k < n; k++) yield { type: 'mark-sorted', i: k };
}
