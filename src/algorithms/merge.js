export const pseudocode = [
  'mergeSort(lo, hi):',
  '  if lo >= hi: return',
  '  mid = (lo + hi) / 2',
  '  mergeSort(lo, mid)',
  '  mergeSort(mid+1, hi)',
  '  merge: while left and right:',
  '    if left ≤ right: take left',
  '    else: take right',
];

export function* mergeSort(arr) {
  const n = arr.length;
  yield* mergeSortRange(arr, 0, n - 1);
  yield { type: 'range', lo: null, hi: null };
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}

function* mergeSortRange(arr, lo, hi) {
  if (lo >= hi) return;
  const mid = (lo + hi) >> 1;
  yield* mergeSortRange(arr, lo, mid);
  yield* mergeSortRange(arr, mid + 1, hi);
  yield* merge(arr, lo, mid, hi);
}

function* merge(arr, lo, mid, hi) {
  yield { type: 'range', lo, hi, role: 'merge' };
  const left = arr.slice(lo, mid + 1);
  const right = arr.slice(mid + 1, hi + 1);
  let i = 0, j = 0, k = lo;
  while (i < left.length && j < right.length) {
    yield { type: 'compare', i: lo + i, j: mid + 1 + j, line: 5 };
    if (left[i] <= right[j]) {
      arr[k] = left[i];
      yield { type: 'overwrite', i: k, value: left[i], line: 6 };
      i++;
    } else {
      arr[k] = right[j];
      yield { type: 'overwrite', i: k, value: right[j], line: 7 };
      j++;
    }
    k++;
  }
  while (i < left.length) {
    arr[k] = left[i];
    yield { type: 'overwrite', i: k, value: left[i], line: 6 };
    i++; k++;
  }
  while (j < right.length) {
    arr[k] = right[j];
    yield { type: 'overwrite', i: k, value: right[j], line: 7 };
    j++; k++;
  }
}
