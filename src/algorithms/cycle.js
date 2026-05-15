export const pseudocode = [
  'for cycleStart = 0 to n-2:',
  '  item = a[cycleStart]',
  '  pos = cycleStart + (#elements < item in suffix)',
  '  if pos != cycleStart: place item at pos',
  '  close cycle until pos == cycleStart',
];

export function* cycleSort(arr) {
  const n = arr.length;
  for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
    let item = arr[cycleStart];
    let pos = cycleStart;
    for (let i = cycleStart + 1; i < n; i++) {
      yield { type: 'compare', i: cycleStart, j: i, line: 2 };
      if (arr[i] < item) pos++;
    }
    if (pos === cycleStart) {
      yield { type: 'mark-sorted', i: cycleStart };
      continue;
    }
    while (item === arr[pos]) pos++;
    let prev = arr[pos];
    arr[pos] = item;
    yield { type: 'overwrite', i: pos, value: item, line: 3 };
    item = prev;
    while (pos !== cycleStart) {
      pos = cycleStart;
      for (let i = cycleStart + 1; i < n; i++) {
        yield { type: 'compare', i: cycleStart, j: i, line: 2 };
        if (arr[i] < item) pos++;
      }
      while (item === arr[pos]) pos++;
      prev = arr[pos];
      arr[pos] = item;
      yield { type: 'overwrite', i: pos, value: item, line: 4 };
      item = prev;
    }
    yield { type: 'mark-sorted', i: cycleStart };
  }
  yield { type: 'mark-sorted', i: n - 1 };
}
