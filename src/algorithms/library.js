export const pseudocode = [
  'insert elements into a gapped array',
  '  binary-search the target slot',
  '  slide into the nearest gap (cheap — gaps are near)',
  'rebalance (re-spread the gaps) when it fills up',
];

// Library sort ("gapped insertion sort"): like insertion sort, but the
// working array is kept padded with empty slots so most insertions only
// shift a few elements before hitting a gap. Periodic rebalancing
// re-spreads the gaps. O(n log n) average with high probability.
export function* librarySort(arr) {
  const n = arr.length;
  if (n === 0) return;

  let cap = Math.max(4, n * 2);
  let S = new Array(cap).fill(undefined); // undefined = gap
  let count = 0;

  function rebalance() {
    const items = [];
    for (let i = 0; i < cap; i++) if (S[i] !== undefined) items.push(S[i]);
    cap = Math.max(4, items.length * 3);
    S = new Array(cap).fill(undefined);
    // Spread items evenly so every element has a gap to its right.
    const step = cap / items.length;
    for (let k = 0; k < items.length; k++) {
      S[Math.min(cap - 1, Math.floor(k * step))] = items[k];
    }
  }

  for (let e = 0; e < n; e++) {
    const x = arr[e];
    if (count > 0 && count * 2 >= cap) rebalance();

    // Gap-aware binary search for the first occupied slot whose value ≥ x.
    let lo = 0, hi = cap - 1, pos = cap;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      let m = mid;
      while (m >= lo && S[m] === undefined) m--;
      if (m < lo) { lo = mid + 1; continue; }
      yield { type: 'compare', i: e, j: e, line: 1 };
      if (S[m] < x) lo = m + 1;
      else { pos = m; hi = m - 1; }
    }

    // Place x at pos, sliding neighbours into the nearest gap.
    if (pos === cap || S[pos] !== undefined) {
      let g = pos;
      while (g < cap && S[g] !== undefined) g++;
      if (g < cap) {
        for (let i = g; i > pos; i--) S[i] = S[i - 1];
        S[pos] = x;
      } else {
        g = pos - 1;
        while (g >= 0 && S[g] !== undefined) g--;
        for (let i = g; i < pos - 1; i++) S[i] = S[i + 1];
        S[pos - 1] = x;
      }
    } else {
      S[pos] = x;
    }
    count++;
  }

  let k = 0;
  for (let i = 0; i < cap; i++) {
    if (S[i] === undefined) continue;
    arr[k] = S[i];
    yield { type: 'overwrite', i: k, value: S[i], line: 3 };
    k++;
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
