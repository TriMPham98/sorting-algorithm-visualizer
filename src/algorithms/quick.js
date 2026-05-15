export const pseudocode = [
  'quickSort(lo, hi):',
  '  if lo >= hi: return',
  '  pivot = a[hi]; i = lo - 1',
  '  for j = lo to hi-1:',
  '    if a[j] <= pivot:',
  '      i++; swap a[i], a[j]',
  '  swap a[i+1], a[hi]',
];

export function* quickSort(arr) {
  yield* quickRange(arr, 0, arr.length - 1);
  yield { type: 'range', lo: null, hi: null };
  yield { type: 'pivot', i: null };
  for (let i = 0; i < arr.length; i++) yield { type: 'mark-sorted', i };
}

function* quickRange(arr, lo, hi) {
  if (lo >= hi) {
    if (lo === hi && lo >= 0 && lo < arr.length) yield { type: 'mark-sorted', i: lo };
    return;
  }
  yield { type: 'range', lo, hi, role: 'partition' };
  yield { type: 'pivot', i: hi };
  const p = yield* partition(arr, lo, hi);
  yield { type: 'pivot', i: null };
  yield { type: 'mark-sorted', i: p };
  yield* quickRange(arr, lo, p - 1);
  yield* quickRange(arr, p + 1, hi);
}

function* partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    yield { type: 'compare', i: j, j: hi, line: 4 };
    if (arr[j] <= pivot) {
      i++;
      if (i !== j) {
        const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        yield { type: 'swap', i, j, line: 5 };
      }
    }
  }
  if (i + 1 !== hi) {
    const t = arr[i + 1]; arr[i + 1] = arr[hi]; arr[hi] = t;
    yield { type: 'swap', i: i + 1, j: hi, line: 6 };
  }
  return i + 1;
}
