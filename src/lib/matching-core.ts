export function derangement<T>(items: T[]): T[] {
  if (items.length < 2) return [];
  const arr = [...items];
  // Sattolo's algorithm for derangement (cyclic permutation)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure no fixed points; if any fixed point occurs, retry up to a few times
  for (let attempts = 0; attempts < 5; attempts++) {
    let hasFixedPoint = false;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === items[i]) { hasFixedPoint = true; break; }
    }
    if (!hasFixedPoint) return arr;
    // re-shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  // last resort simple rotation
  return items.map((_, i) => items[(i + 1) % items.length]);
}

export function pairAssignments(userIds: string[]): Record<string, string> {
  if (userIds.length < 3) throw new Error('min_members');
  const receivers = derangement(userIds);
  const result: Record<string, string> = {};
  userIds.forEach((giver, idx) => { result[giver] = receivers[idx]; });
  return result;
}
