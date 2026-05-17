export const pseudocode = [
  'for each x: schedule a wake-up after x ticks',
  'advance a virtual clock tick by tick',
  'when a timer fires, append its value to a',
  '(joke sort — simulated deterministically here)',
];

// Sleep sort: spawn one timer per element that sleeps for a duration
// proportional to its value; values wake in ascending order. The real
// thing relies on the OS scheduler (and is hilariously unreliable). Here
// the virtual clock is stepped deterministically so it always sorts.
export function* sleepSort(arr) {
  const n = arr.length;
  if (n === 0) return;
  let min = arr[0], max = arr[0];
  for (let i = 1; i < n; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
  }

  const order = [];
  for (let t = min; t <= max; t++) {
    for (let i = 0; i < n; i++) {
      yield { type: 'compare', i, j: i, line: 1 };
      if (arr[i] === t) order.push(arr[i]); // this timer fires now
    }
  }
  for (let i = 0; i < n; i++) {
    arr[i] = order[i];
    yield { type: 'overwrite', i, value: order[i], line: 2 };
  }
  for (let i = 0; i < n; i++) yield { type: 'mark-sorted', i };
}
