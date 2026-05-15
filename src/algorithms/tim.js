export const pseudocode = [
  'MIN_RUN = 16',
  'for start = 0 to n step MIN_RUN:',
  '  insertion-sort run at start',
  'for size = MIN_RUN; size < n; size *= 2:',
  '  for left = 0 to n step 2*size:',
  '    merge runs at left, left+size',
];

const MIN_RUN = 16;

export function* timSort(arr) {
  const n = arr.length;
  if (n <= 1) {
    if (n === 1) yield { type: 'mark-sorted', i: 0 };
    return;
  }

  // Phase 1: insertion-sort each run.
  for (let start = 0; start < n; start += MIN_RUN) {
    const end = Math.min(start + MIN_RUN - 1, n - 1);
    yield { type: 'range', lo: start, hi: end, role: 'run' };
    yield* insertionRange(arr, start, end);
  }
  yield { type: 'range', lo: null, hi: null };

  // Phase 2: bottom-up merge of runs of increasing size.
  for (let size = MIN_RUN; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = left + size - 1;
      const right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) yield* merge(arr, left, mid, right);
    }
  }
  yield { type: 'range', lo: null, hi: null };
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}

function* insertionRange(arr, lo, hi) {
  for (let i = lo + 1; i <= hi; i++) {
    let j = i;
    while (j > lo) {
      yield { type: 'compare', i: j - 1, j, line: 2 };
      if (arr[j - 1] > arr[j]) {
        const t = arr[j]; arr[j] = arr[j - 1]; arr[j - 1] = t;
        yield { type: 'swap', i: j - 1, j, line: 2 };
        j--;
      } else break;
    }
  }
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
      yield { type: 'overwrite', i: k, value: left[i], line: 5 };
      i++;
    } else {
      arr[k] = right[j];
      yield { type: 'overwrite', i: k, value: right[j], line: 5 };
      j++;
    }
    k++;
  }
  while (i < left.length) {
    arr[k] = left[i];
    yield { type: 'overwrite', i: k, value: left[i], line: 5 };
    i++; k++;
  }
  while (j < right.length) {
    arr[k] = right[j];
    yield { type: 'overwrite', i: k, value: right[j], line: 5 };
    j++; k++;
  }
}
