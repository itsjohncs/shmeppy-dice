import { Token } from '../lexer';

export class ParseErrorMessage {
  constructor(public message: string, public token: Token | undefined, public stackTrace: string) { }

  toString(): string {
    return this.message;
  }
}
