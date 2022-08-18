import { DiceResult } from './dice-result.class';

export class InterpreterError extends Error {
  diceResult: DiceResult;

  constructor(diceResult: DiceResult) {
    const messages: string[] = [];
    for (let i = 0; i < diceResult.errors.length; ++i) {
      messages.push(`(${i + 1}) ${diceResult.errors[i].toString()}`);
    }

    super(`${diceResult.errors.length} error(s) occurred while rolling: ${messages.join('. ')}`);

    this.diceResult = diceResult;
  }
}
