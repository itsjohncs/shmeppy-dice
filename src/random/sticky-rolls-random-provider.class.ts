import { Random, MersenneTwister19937, createEntropy } from 'random-js';

import { RandomProvider } from './random-provider.class';

export class StickyRollsRandomProvider implements RandomProvider {
  private initialSeed: number;
  private randomSources: Map<string, Random> = new Map();

  private getRandomSource(min: number, max: number): Random {
    const key = `${min};${max}`;
    let source = this.randomSources.get(key);
    if (!source) {
      source = new Random(MersenneTwister19937.seedWithArray([this.initialSeed, min, max]));
      this.randomSources.set(key, source);
    }

    return source;
  }

  constructor(seed?: number) {
    this.initialSeed = seed ?? createEntropy(undefined, 1)[0];
  }

  numberBetween(min: number, max: number): number {
    return this.getRandomSource(min, max).integer(min, max);
  }

  getInitialSeed(): number {
    return this.initialSeed;
  }

  newFromSeed(seed: number): StickyRollsRandomProvider {
    return new StickyRollsRandomProvider(seed);
  }
}
