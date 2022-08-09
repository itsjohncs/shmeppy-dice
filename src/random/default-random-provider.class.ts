import { Random, MersenneTwister19937 } from 'random-js';

import { RandomProvider } from './random-provider.class';

export class DefaultRandomProvider implements RandomProvider {

  private random: Random;

  constructor() {
    this.random = new Random(MersenneTwister19937.autoSeed());
  }

  numberBetween(min: number, max: number) {
    return this.random.integer(min, max);
  }
}
