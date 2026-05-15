export const pseudocode = [
  'start, end = 0, n-1',
  'repeat until no swaps:',
  '  forward: for i = start to end-1:',
  '    if a[i] > a[i+1]: swap',
  '  end = end - 1',
  '  backward: for i = end-1 down to start:',
  '    if a[i] > a[i+1]: swap',
  '  start = start + 1',
];

export function* cocktailSort(arr) {
  const n = arr.length;
  let start = 0;
  let end = n - 1;
  let swapped = true;
  while (swapped && start <= end) {
    swapped = false;
    for (let i = start; i < end; i++) {
      yield { type: 'compare', i, j: i + 1, line: 2 };
      if (arr[i] > arr[i + 1]) {
        const t = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = t;
        yield { type: 'swap', i, j: i + 1, line: 3 };
        swapped = true;
      }
    }
    yield { type: 'mark-sorted', i: end };
    end--;
    if (!swapped || start > end) break;
    swapped = false;
    for (let i = end; i > start; i--) {
      yield { type: 'compare', i: i - 1, j: i, line: 5 };
      if (arr[i - 1] > arr[i]) {
        const t = arr[i - 1]; arr[i - 1] = arr[i]; arr[i] = t;
        yield { type: 'swap', i: i - 1, j: i, line: 6 };
        swapped = true;
      }
    }
    yield { type: 'mark-sorted', i: start };
    start++;
  }
  for (let i = start; i <= end; i++) yield { type: 'mark-sorted', i };
}
