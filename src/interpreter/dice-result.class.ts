import { ExpressionNode } from '../ast';
import { InterpreterErrorMessage } from '../interpreter/error-message.class';
import { Result } from './result.class';

export class DiceResult extends Result {
  readonly initialSeed: number;
  readonly successes: number;
  readonly failures: number;
  readonly errors: InterpreterErrorMessage[];

  constructor(
    expression: ExpressionNode,
    renderedExpression: string,
    total: number,
    initialSeed: number,
    successes: number,
    failures: number,
    errors: InterpreterErrorMessage[]
  ) {
    super(expression, renderedExpression, total);
    this.initialSeed = initialSeed;
    this.successes = successes;
    this.failures = failures;
    this.errors = errors;
  }
}
