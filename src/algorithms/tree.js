export const pseudocode = [
  'for x in a: insert x into a BST',
  '  go left if x < node, else right',
  'in-order traversal yields sorted order',
  'write the traversal back into a',
];

// Tree sort: build an (unbalanced) binary search tree by inserting each
// element, then read it back via in-order traversal. O(n log n) average,
// O(n²) on already-sorted input (degenerate linked-list tree).
export function* treeSort(arr) {
  const n = arr.length;
  if (n === 0) return;

  const make = (val, idx) => ({ val, idx, left: null, right: null });
  let root = null;

  for (let i = 0; i < n; i++) {
    const val = arr[i];
    if (!root) { root = make(val, i); continue; }
    let cur = root;
    while (true) {
      yield { type: 'compare', i, j: cur.idx, line: 1 };
      if (val < cur.val) {
        if (cur.left) cur = cur.left;
        else { cur.left = make(val, i); break; }
      } else {
        if (cur.right) cur = cur.right;
        else { cur.right = make(val, i); break; }
      }
    }
  }

  const out = [];
  const stack = [];
  let node = root;
  while (stack.length || node) {
    while (node) { stack.push(node); node = node.left; }
    node = stack.pop();
    out.push(node.val);
    node = node.right;
  }

  for (let i = 0; i < n; i++) {
    arr[i] = out[i];
    yield { type: 'overwrite', i, value: out[i], line: 3 };
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
