export const pseudocode = [
  'heapSort(a):',
  '  build max-heap',
  '  for end = n-1 down to 1:',
  '    swap a[0], a[end]',
  '    siftDown(0, end):',
  '      compare with larger child; swap',
];

export function* heapSort(arr) {
  const n = arr.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    yield* siftDown(arr, i, n);
  }
  yield { type: 'heap-end', end: n };
  for (let end = n - 1; end > 0; end--) {
    const t = arr[0]; arr[0] = arr[end]; arr[end] = t;
    yield { type: 'swap', i: 0, j: end, line: 3 };
    yield { type: 'heap-end', end };
    yield* siftDown(arr, 0, end);
  }
  yield { type: 'heap-end', end: null };
  if (n > 0) yield { type: 'mark-sorted', i: 0 };
}

function* siftDown(arr, root, end) {
  let r = root;
  while (true) {
    const left = 2 * r + 1;
    const right = 2 * r + 2;
    let largest = r;
    if (left < end) {
      yield { type: 'compare', i: largest, j: left, line: 5 };
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < end) {
      yield { type: 'compare', i: largest, j: right, line: 5 };
      if (arr[right] > arr[largest]) largest = right;
    }
    if (largest === r) break;
    const t = arr[r]; arr[r] = arr[largest]; arr[largest] = t;
    yield { type: 'swap', i: r, j: largest, line: 5 };
    r = largest;
  }
}
