export const pseudocode = [
  'B = ⌈√n⌉ empty buckets',
  'for x in a: drop x into bucket ⌊(x/max)·B⌋',
  'insertion-sort each bucket',
  'concatenate buckets back into a',
];

export function* bucketSort(arr) {
  const n = arr.length;
  if (n === 0) return;
  let max = arr[0];
  for (let i = 1; i < n; i++) if (arr[i] > max) max = arr[i];

  const B = Math.max(1, Math.floor(Math.sqrt(n)));
  const buckets = Array.from({ length: B }, () => []);

  // Scatter: each input read flashes its bar.
  for (let i = 0; i < n; i++) {
    yield { type: 'compare', i, j: i, line: 1 };
    let b = Math.floor(((arr[i] - 1) / max) * B);
    if (b < 0) b = 0;
    if (b >= B) b = B - 1;
    buckets[b].push(arr[i]);
  }

  // Sort each bucket (plain insertion sort) and gather back.
  let k = 0;
  for (let b = 0; b < B; b++) {
    const bk = buckets[b];
    for (let x = 1; x < bk.length; x++) {
      const key = bk[x];
      let y = x - 1;
      while (y >= 0 && bk[y] > key) { bk[y + 1] = bk[y]; y--; }
      bk[y + 1] = key;
    }
    for (let x = 0; x < bk.length; x++) {
      arr[k] = bk[x];
      yield { type: 'overwrite', i: k, value: bk[x], line: 3 };
      k++;
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
