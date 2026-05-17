export const pseudocode = [
  'while input remains:',
  '  pull out an increasing subsequence (a "strand")',
  '  merge that strand into the result list',
  'copy the result back into a',
];

// Strand sort: repeatedly extract a rising run ("strand") from the input
// and merge it into a growing sorted result. O(n) on already-sorted data,
// O(n²) worst case.
export function* strandSort(arr) {
  const n = arr.length;
  if (n === 0) return;

  const input = arr.map((val, idx) => ({ val, idx }));
  let result = [];

  while (input.length) {
    const strand = [input.shift()];
    for (let i = 0; i < input.length; ) {
      const last = strand[strand.length - 1];
      yield { type: 'compare', i: input[i].idx, j: last.idx, line: 1 };
      if (input[i].val >= last.val) {
        strand.push(input[i]);
        input.splice(i, 1);
      } else {
        i++;
      }
    }
    // Merge the (sorted) strand into the (sorted) result.
    const merged = [];
    let a = 0, b = 0;
    while (a < result.length && b < strand.length) {
      yield { type: 'compare', i: result[a].idx, j: strand[b].idx, line: 2 };
      if (result[a].val <= strand[b].val) merged.push(result[a++]);
      else merged.push(strand[b++]);
    }
    while (a < result.length) merged.push(result[a++]);
    while (b < strand.length) merged.push(strand[b++]);
    result = merged;
  }

  for (let i = 0; i < n; i++) {
    arr[i] = result[i].val;
    yield { type: 'overwrite', i, value: result[i].val, line: 3 };
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
