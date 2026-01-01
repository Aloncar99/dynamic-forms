/**
 * uid() => generise unikatan ID.
 * Koristimo ga za:
 *  - sekcije  (prefix: 's')
 *  - pitanja  (prefix: 'q')
 *  - opcije   (prefix: 'o')
 */
export function uid(prefix = 'id'): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`
  );
}

/**
 * nextCode() => generise sljedeci kod za prikaz korisniku:
 *  - S-001, S-002...
 *  - Q-001, Q-002...
 *
 * Bitno: kodovi nisu "ID" (ID je uid), nego su "human readable" labela.
 */
export function nextCode(prefix: 'S' | 'Q', existingCodes: string[]): string {
  const nums = existingCodes
    .map((c) => Number(c.split('-')[1]))
    .filter((n) => Number.isFinite(n));

  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}
