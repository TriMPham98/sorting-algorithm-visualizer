export const pseudocode = [
  'min, max = range of a',
  'hole[v−min] collects every x equal to v',
  'for x in a: hole[x−min].push(x)',
  'walk holes in order, writing values back',
];

export function* pigeonholeSort(arr) {
  const n = arr.length;
  if (n === 0) return;
  let min = arr[0], max = arr[0];
  for (let i = 1; i < n; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
  }
  const size = max - min + 1;
  const holes = Array.from({ length: size }, () => []);

  for (let i = 0; i < n; i++) {
    yield { type: 'compare', i, j: i, line: 2 };
    holes[arr[i] - min].push(arr[i]);
  }

  let k = 0;
  for (let h = 0; h < size; h++) {
    for (const v of holes[h]) {
      arr[k] = v;
      yield { type: 'overwrite', i: k, value: v, line: 3 };
      k++;
    }
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
