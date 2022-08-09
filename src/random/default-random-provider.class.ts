import { Random, MersenneTwister19937, createEntropy } from 'random-js';

import { RandomProvider } from './random-provider.class';

export class DefaultRandomProvider implements RandomProvider {
  private random: Random;
  private initialSeed: number;

  constructor(seed?: number) {
    this.initialSeed = seed ?? createEntropy(undefined, 1)[0];
    this.random = new Random(MersenneTwister19937.seed(this.initialSeed));
  }

  numberBetween(min: number, max: number) {
    return this.random.integer(min, max);
  }

  getInitialSeed(): number {
    return this.initialSeed;
  }

  newFromSeed(seed: number): DefaultRandomProvider {
    return new DefaultRandomProvider(seed);
  }
}
