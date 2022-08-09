import { Token } from '../lexer';

export class ParseErrorMessage {
  constructor(public message: string, public token: Token, public stackTrace: string) { }

  toString(): string {
    return this.message;
  }
}
