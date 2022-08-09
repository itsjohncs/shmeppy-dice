import { ParseResult } from './parse-result.class';

export class ParseError extends Error {
  parseResult: ParseResult;

  constructor(parseResult: ParseResult) {
    const messages: string[] = [];
    for (let i = 0; i < parseResult.errors.length; ++i) {
      messages.push(`(${i + 1}) ${parseResult.errors[i].toString()}`);
    }

    super(`${parseResult.errors.length} error(s) occurred during parsing: ${messages.join('. ')}`);

    this.parseResult = parseResult;
  }
}
