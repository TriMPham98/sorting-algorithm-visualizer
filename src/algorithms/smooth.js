export const pseudocode = [
  'grow a forest of Leonardo heaps over a (left → right)',
  '  trinkle: float each new root left, then sift down',
  'dequeue from the right: the last root is the max',
  '  expose its two child heaps, trinkle them, repeat',
];

// Smoothsort (Dijkstra, EWD796a): a heapsort variant whose heap is a
// forest of Leonardo heaps instead of one binary heap. Adaptive — O(n) on
// already-sorted input, O(n log n) worst case, O(1) extra space. This
// implementation tracks the tree forest explicitly (orders + root indices)
// rather than the classic packed bitvector, which is easier to follow.
export function* smoothSort(arr) {
  const n = arr.length;
  if (n <= 1) {
    for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
    return;
  }

  // Leonardo numbers: L0 = L1 = 1, Lk = L(k-1) + L(k-2) + 1.
  const LP = [1, 1];
  while (LP[LP.length - 1] < n) LP.push(LP[LP.length - 1] + LP[LP.length - 2] + 1);

  // Each forest entry: { idx: root array-index, ord: Leonardo order }.
  const trees = [];

  function* swap(i, j) {
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    yield { type: 'swap', i, j, line: 1 };
  }

  // Sift the root of an order-`order` heap rooted at `root` down into place.
  function* siftDown(root, order) {
    while (order > 1) {
      const rt = root - 1;                    // right child (order-2)
      const lf = root - 1 - LP[order - 2];     // left child  (order-1)
      yield { type: 'compare', i: root, j: lf, line: 1 };
      yield { type: 'compare', i: root, j: rt, line: 1 };
      if (arr[root] >= arr[lf] && arr[root] >= arr[rt]) break;
      if (arr[lf] >= arr[rt]) { yield* swap(root, lf); root = lf; order -= 1; }
      else { yield* swap(root, rt); root = rt; order -= 2; }
    }
  }

  // Float the root of tree `pos` left across earlier roots, then sift.
  function* trinkle(pos) {
    let root = trees[pos].idx;
    let order = trees[pos].ord;
    let t = pos;
    while (t > 0) {
      const stepson = trees[t - 1].idx;
      yield { type: 'compare', i: root, j: stepson, line: 0 };
      if (arr[stepson] <= arr[root]) break;
      if (order > 1) {
        const rt = root - 1;
        const lf = root - 1 - LP[order - 2];
        if (arr[rt] >= arr[stepson] || arr[lf] >= arr[stepson]) break;
      }
      yield* swap(root, stepson);
      root = stepson;
      order = trees[t - 1].ord;
      t--;
    }
    yield* siftDown(root, order);
  }

  // ---- Build the forest -------------------------------------------------
  for (let i = 0; i < n; i++) {
    const len = trees.length;
    if (len >= 2 && trees[len - 2].ord === trees[len - 1].ord + 1) {
      // The two rightmost consecutive heaps merge under the new node.
      const newOrd = trees[len - 2].ord + 1;
      trees.pop();
      trees.pop();
      trees.push({ idx: i, ord: newOrd });
    } else if (len >= 1 && trees[len - 1].ord === 1) {
      trees.push({ idx: i, ord: 0 });
    } else {
      trees.push({ idx: i, ord: 1 });
    }
    yield* trinkle(trees.length - 1);
  }

  // ---- Dequeue from the right ------------------------------------------
  for (let end = n - 1; end > 0; end--) {
    const last = trees[trees.length - 1];
    if (last.ord <= 1) {
      trees.pop(); // singleton root already in its final position
    } else {
      const o = last.ord;
      const R = last.idx;
      const leftRoot = R - 1 - LP[o - 2];
      const rightRoot = R - 1;
      trees.pop();
      trees.push({ idx: leftRoot, ord: o - 1 });
      yield* trinkle(trees.length - 1);
      trees.push({ idx: rightRoot, ord: o - 2 });
      yield* trinkle(trees.length - 1);
    }
    yield { type: 'mark-sorted', i: end };
  }
  yield { type: 'mark-sorted', i: 0 };
}
