export function appendUnique<T extends { tmdb_id: number }>(
  existing: T[],
  incoming: T[],
) {
  const seen = new Set(existing.map((item) => item.tmdb_id));
  const next = incoming.filter((item) => !seen.has(item.tmdb_id));
  return next.length === 0 ? existing : [...existing, ...next];
}
