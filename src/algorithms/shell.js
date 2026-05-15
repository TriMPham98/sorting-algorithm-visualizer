export const pseudocode = [
  'for gap = n/2; gap > 0; gap /= 2:',
  '  for i = gap to n-1:',
  '    j = i',
  '    while j >= gap and a[j-gap] > a[j]:',
  '      swap a[j-gap], a[j]',
  '      j = j - gap',
];

export function* shellSort(arr) {
  const n = arr.length;
  for (let gap = n >> 1; gap > 0; gap >>= 1) {
    for (let i = gap; i < n; i++) {
      let j = i;
      while (j >= gap) {
        yield { type: 'compare', i: j - gap, j, line: 3 };
        if (arr[j - gap] > arr[j]) {
          const t = arr[j]; arr[j] = arr[j - gap]; arr[j - gap] = t;
          yield { type: 'swap', i: j - gap, j, line: 4 };
          j -= gap;
        } else {
          break;
        }
      }
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
