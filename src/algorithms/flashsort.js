export const pseudocode = [
  'classify: k = ⌊c·(a[i] − min)⌋, count classes',
  'prefix-sum class boundaries L[]',
  'permutation: cycle each element into its class',
  'final short-range insertion sort',
];

// Neubert's Flashsort: a distribution sort that is ~O(n) on uniformly
// distributed data. Three phases — classification, in-place permutation
// into class buckets, then a near-sorted insertion pass.
export function* flashSort(arr) {
  const n = arr.length;
  if (n <= 1) {
    for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
    return;
  }

  let min = arr[0];
  let maxIndex = 0;
  for (let i = 1; i < n; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > arr[maxIndex]) maxIndex = i;
  }
  if (min === arr[maxIndex]) {
    // All equal — already sorted.
    for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
    return;
  }

  const m = Math.max(1, Math.floor(0.45 * n));
  const L = new Array(m).fill(0);
  const c = (m - 1) / (arr[maxIndex] - min);

  // Phase 1 — classification.
  for (let i = 0; i < n; i++) {
    yield { type: 'compare', i, j: i, line: 0 };
    const k = Math.floor(c * (arr[i] - min));
    L[k]++;
  }
  // Phase 2 — turn counts into cumulative class boundaries.
  for (let k = 1; k < m; k++) L[k] += L[k - 1];

  // Move the global maximum to the front so the cycle leader is correct.
  if (maxIndex !== 0) {
    const t = arr[0]; arr[0] = arr[maxIndex]; arr[maxIndex] = t;
    yield { type: 'swap', i: 0, j: maxIndex, line: 2 };
  }

  // Phase 3 — permutation: walk cycles, dropping each element into its class.
  let move = 0;
  let j = 0;
  let k = m - 1;
  while (move < n - 1) {
    while (j > L[k] - 1) {
      j++;
      k = Math.floor(c * (arr[j] - min));
    }
    let flash = arr[j];
    while (j !== L[k]) {
      k = Math.floor(c * (flash - min));
      const dest = L[k] - 1;
      const hold = arr[dest];
      arr[dest] = flash;
      yield { type: 'overwrite', i: dest, value: flash, line: 2 };
      flash = hold;
      L[k]--;
      move++;
    }
  }

  // Phase 4 — elements are class-local; a straight insertion sort finishes.
  for (let i = n - 2; i >= 0; i--) {
    yield { type: 'compare', i, j: i + 1, line: 3 };
    if (arr[i + 1] < arr[i]) {
      const t = arr[i];
      let p = i;
      while (p + 1 < n && arr[p + 1] < t) {
        arr[p] = arr[p + 1];
        yield { type: 'overwrite', i: p, value: arr[p], line: 3 };
        p++;
      }
      arr[p] = t;
      yield { type: 'overwrite', i: p, value: t, line: 3 };
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
