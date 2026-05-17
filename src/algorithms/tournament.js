export const pseudocode = [
  'seed a binary tournament tree with the n values',
  'winner = min of every match up to the root',
  'emit the root, replace its leaf with +∞',
  'replay only the winner\'s path, repeat',
];

// Tournament sort: a selection sort whose "find the minimum" step is a
// single-elimination tournament. After each winner is emitted only the
// path from its leaf to the root is replayed — O(log n) per element, so
// O(n log n) overall. The conceptual ancestor of heapsort.
export function* tournamentSort(arr) {
  const n = arr.length;
  if (n === 0) return;

  let leaves = 1;
  while (leaves < n) leaves <<= 1;

  const INF = { val: Infinity, idx: -1 };
  // Complete binary tree in an array: tree[1] is the root, leaves at
  // [leaves, 2·leaves). Each node stores the winning {val, idx}.
  const tree = new Array(2 * leaves);
  for (let i = 0; i < leaves; i++) {
    tree[leaves + i] = i < n ? { val: arr[i], idx: i } : INF;
  }
  for (let p = leaves - 1; p >= 1; p--) {
    const a = tree[2 * p], b = tree[2 * p + 1];
    if (a.idx >= 0 && b.idx >= 0) {
      yield { type: 'compare', i: a.idx, j: b.idx, line: 1 };
    }
    tree[p] = a.val <= b.val ? a : b;
  }

  for (let out = 0; out < n; out++) {
    const winner = tree[1];
    arr[out] = winner.val;
    yield { type: 'overwrite', i: out, value: winner.val, line: 2 };

    // Retire the winning leaf, then replay only its path to the root.
    let node = leaves + winner.idx;
    tree[node] = INF;
    node >>= 1;
    while (node >= 1) {
      const a = tree[2 * node], b = tree[2 * node + 1];
      if (a.idx >= 0 && b.idx >= 0) {
        yield { type: 'compare', i: a.idx, j: b.idx, line: 3 };
      }
      tree[node] = a.val <= b.val ? a : b;
      node >>= 1;
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
