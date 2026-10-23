/**
 * Pure, deterministic 32-bit PRNG (Mulberry32) with seed normalization and
 * immutable state stepping so game states can be serialized and replayed.
 */

export function normalizeSeed(seed: number | string): number {
  if (typeof seed === 'number') {
    const intSeed = seed | 0;
    return intSeed === 0 ? 0x6d2b79f5 : intSeed >>> 0;
  }
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h === 0 ? 0x6d2b79f5 : h >>> 0;
}

export function stepRng(state: number): { value: number; nextState: number } {
  const nextState = (state + 0x6d2b79f5) >>> 0;
  let t = nextState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextState };
}

export function nextInt(
  state: number,
  maxExclusive: number,
): { value: number; nextState: number } {
  if (maxExclusive <= 1) {
    const stepped = stepRng(state);
    return { value: 0, nextState: stepped.nextState };
  }
  const stepped = stepRng(state);
  return {
    value: Math.floor(stepped.value * maxExclusive),
    nextState: stepped.nextState,
  };
}

/**
 * Deterministic Fisher-Yates shuffle returning a new array and the next RNG state.
 */
export function shuffleWithRng<T>(
  items: readonly T[],
  rngState: number,
): { items: T[]; nextState: number } {
  const result = [...items];
  let currentState = rngState;

  for (let i = result.length - 1; i > 0; i--) {
    const rand = nextInt(currentState, i + 1);
    currentState = rand.nextState;
    const j = rand.value;
    const temp = result[i];
    const swapItem = result[j];
    if (temp !== undefined && swapItem !== undefined) {
      result[i] = swapItem;
      result[j] = temp;
    }
  }

  return { items: result, nextState: currentState };
}

export type SeededRng = {
  nextFloat: () => number;
  nextInt: (maxExclusive: number) => number;
  shuffle: <T>(items: readonly T[]) => T[];
  getState: () => number;
};

export function createRng(seed: number | string): SeededRng {
  let state = normalizeSeed(seed);
  return {
    nextFloat() {
      const stepped = stepRng(state);
      state = stepped.nextState;
      return stepped.value;
    },
    nextInt(maxExclusive: number) {
      const stepped = nextInt(state, maxExclusive);
      state = stepped.nextState;
      return stepped.value;
    },
    shuffle<T>(items: readonly T[]): T[] {
      const shuffled = shuffleWithRng(items, state);
      state = shuffled.nextState;
      return shuffled.items;
    },
    getState() {
      return state;
    },
  };
}
