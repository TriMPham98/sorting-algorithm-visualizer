export function* quickSort(arr) {
  yield* quickRange(arr, 0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) yield { type: 'mark-sorted', i };
}

function* quickRange(arr, lo, hi) {
  if (lo >= hi) {
    if (lo === hi && lo >= 0 && lo < arr.length) yield { type: 'mark-sorted', i: lo };
    return;
  }
  const p = yield* partition(arr, lo, hi);
  yield { type: 'mark-sorted', i: p };
  yield* quickRange(arr, lo, p - 1);
  yield* quickRange(arr, p + 1, hi);
}

function* partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    yield { type: 'compare', i: j, j: hi };
    if (arr[j] <= pivot) {
      i++;
      if (i !== j) {
        const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        yield { type: 'swap', i, j };
      }
    }
  }
  if (i + 1 !== hi) {
    const t = arr[i + 1]; arr[i + 1] = arr[hi]; arr[hi] = t;
    yield { type: 'swap', i: i + 1, j: hi };
  }
  return i + 1;
}
