export interface RandomProvider {
  numberBetween(min: number, max: number): number;
  getInitialSeed(): number;
  newFromSeed(seed?: number): RandomProvider;
}
