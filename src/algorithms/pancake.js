export const pseudocode = [
  'for size = n down to 2:',
  '  find idx of max in a[0..size-1]',
  '  flip a[0..idx]   // bring max to front',
  '  flip a[0..size-1]   // bring max to end',
];

export function* pancakeSort(arr) {
  const n = arr.length;
  for (let size = n; size > 1; size--) {
    let maxIdx = 0;
    for (let i = 1; i < size; i++) {
      yield { type: 'compare', i: maxIdx, j: i, line: 1 };
      if (arr[i] > arr[maxIdx]) maxIdx = i;
    }
    if (maxIdx !== size - 1) {
      if (maxIdx > 0) yield* flip(arr, maxIdx, 2);
      yield* flip(arr, size - 1, 3);
    }
    yield { type: 'mark-sorted', i: size - 1 };
  }
  if (n > 0) yield { type: 'mark-sorted', i: 0 };
}

function* flip(arr, endIdx, line) {
  let lo = 0, hi = endIdx;
  while (lo < hi) {
    const t = arr[lo]; arr[lo] = arr[hi]; arr[hi] = t;
    yield { type: 'swap', i: lo, j: hi, line };
    lo++; hi--;
  }
}
