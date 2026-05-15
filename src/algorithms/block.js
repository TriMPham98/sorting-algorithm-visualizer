export const pseudocode = [
  'block(lo, hi):',
  '  if lo >= hi: return',
  '  mid = (lo + hi) / 2',
  '  block(lo, mid)',
  '  block(mid+1, hi)',
  '  in-place merge a[lo..mid] with a[mid+1..hi]',
  '    (rotate via shifts — no aux array)',
];

// Stable in-place merge sort. The real Block Sort (WikiSort) uses an
// internal buffer + sub-block rotations to achieve true O(n log n) in
// O(1) extra space. This simplified version uses shift-based in-place
// merging — same shape (recursive merge sort, no aux array), but the
// shifts during each merge make the total work O(n²) worst case.
export function* blockSort(arr) {
  const n = arr.length;
  if (n > 1) yield* blockRange(arr, 0, n - 1);
  yield { type: 'range', lo: null, hi: null };
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}

function* blockRange(arr, lo, hi) {
  if (lo >= hi) return;
  const mid = (lo + hi) >> 1;
  yield* blockRange(arr, lo, mid);
  yield* blockRange(arr, mid + 1, hi);
  yield* inPlaceMerge(arr, lo, mid, hi);
}

function* inPlaceMerge(arr, lo, mid, hi) {
  yield { type: 'range', lo, hi, role: 'merge' };
  let i = lo;
  while (i <= mid && mid + 1 <= hi) {
    yield { type: 'compare', i, j: mid + 1, line: 6 };
    if (arr[i] <= arr[mid + 1]) {
      i++;
    } else {
      // Rotate arr[mid+1] into position i by shifting arr[i..mid] right.
      const v = arr[mid + 1];
      for (let k = mid + 1; k > i; k--) {
        arr[k] = arr[k - 1];
        yield { type: 'overwrite', i: k, value: arr[k], line: 6 };
      }
      arr[i] = v;
      yield { type: 'overwrite', i, value: v, line: 6 };
      i++;
      mid++;
    }
  }
}
