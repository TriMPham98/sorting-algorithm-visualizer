export const pseudocode = [
  'deal each card onto the leftmost pile',
  '  whose top card is ≥ it (else a new pile)',
  'k-way merge: repeatedly take the smallest',
  '  pile top, writing it back into a',
];

// Patience sort: deal cards into piles (each pile kept non-increasing
// top-down, like the solitaire game), then k-way merge the pile tops.
// O(n log n); the dealing phase also computes the longest increasing
// subsequence (= number of piles).
export function* patienceSort(arr) {
  const n = arr.length;
  if (n === 0) return;

  const piles = [];
  for (let i = 0; i < n; i++) {
    const val = arr[i];
    let placed = false;
    for (let p = 0; p < piles.length; p++) {
      const top = piles[p][piles[p].length - 1];
      yield { type: 'compare', i, j: top.idx, line: 0 };
      if (top.val >= val) {
        piles[p].push({ val, idx: i });
        placed = true;
        break;
      }
    }
    if (!placed) piles.push([{ val, idx: i }]);
  }

  // Merge: each pile's top is its smallest remaining element.
  for (let out = 0; out < n; out++) {
    let best = -1;
    for (let p = 0; p < piles.length; p++) {
      if (piles[p].length === 0) continue;
      const top = piles[p][piles[p].length - 1];
      if (best === -1) { best = p; continue; }
      const bestTop = piles[best][piles[best].length - 1];
      yield { type: 'compare', i: top.idx, j: bestTop.idx, line: 2 };
      if (top.val < bestTop.val) best = p;
    }
    const card = piles[best].pop();
    arr[out] = card.val;
    yield { type: 'overwrite', i: out, value: card.val, line: 3 };
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
