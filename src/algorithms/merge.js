export function* mergeSort(arr) {
  const n = arr.length;
  yield* mergeSortRange(arr, 0, n - 1);
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
  const left = arr.slice(lo, mid + 1);
  const right = arr.slice(mid + 1, hi + 1);
  let i = 0, j = 0, k = lo;
  while (i < left.length && j < right.length) {
    // compare relative to current positions in original array
    yield { type: 'compare', i: lo + i, j: mid + 1 + j };
    if (left[i] <= right[j]) {
      arr[k] = left[i];
      yield { type: 'overwrite', i: k, value: left[i] };
      i++;
    } else {
      arr[k] = right[j];
      yield { type: 'overwrite', i: k, value: right[j] };
      j++;
    }
    k++;
  }
  while (i < left.length) {
    arr[k] = left[i];
    yield { type: 'overwrite', i: k, value: left[i] };
    i++; k++;
  }
  while (j < right.length) {
    arr[k] = right[j];
    yield { type: 'overwrite', i: k, value: right[j] };
    j++; k++;
  }
}
