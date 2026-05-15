export const pseudocode = [
  'stooge(lo, hi):',
  '  if a[lo] > a[hi]: swap',
  '  if hi - lo + 1 >= 3:',
  '    t = (hi - lo + 1) / 3',
  '    stooge(lo, hi - t)',
  '    stooge(lo + t, hi)',
  '    stooge(lo, hi - t)',
];

export function* stoogeSort(arr) {
  const n = arr.length;
  if (n > 1) yield* stooge(arr, 0, n - 1);
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}

function* stooge(arr, lo, hi) {
  yield { type: 'compare', i: lo, j: hi, line: 1 };
  if (arr[lo] > arr[hi]) {
    const t = arr[lo]; arr[lo] = arr[hi]; arr[hi] = t;
    yield { type: 'swap', i: lo, j: hi, line: 1 };
  }
  if (hi - lo + 1 >= 3) {
    const t = Math.floor((hi - lo + 1) / 3);
    yield* stooge(arr, lo, hi - t);
    yield* stooge(arr, lo + t, hi);
    yield* stooge(arr, lo, hi - t);
  }
}
