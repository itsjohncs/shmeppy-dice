import { ExpressionNode } from '../ast';

export class InterpreterErrorMessage {
  constructor(public message: string, public expression: ExpressionNode, public stack: string = (new Error().stack)) { }

  toString(): string {
    return this.message;
  }
}
