/**
 * Deterministic pseudo-randomness.
 *
 * Every generated item is a pure function of its seed. That is what makes
 * generated content reviewable: given the seed printed on the item, anyone can
 * reproduce it exactly, including the key and every distractor. Nothing about
 * generation depends on wall-clock time or on hidden state.
 */
export class Rng {
  private state: number;

  constructor(seed: string) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    this.state = h || 1;
  }

  /** Uniform in [0, 1). */
  next(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 4294967296;
  }

  /** Uniform integer in [min, max]. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** `count` distinct members, or everything if the pool is smaller. */
  sample<T>(items: readonly T[], count: number): T[] {
    return this.shuffle(items).slice(0, Math.min(count, items.length));
  }
}
