import { CharacterStream } from './character-stream.interface';
import { Lexer } from './lexer.interface';
import { StringCharacterStream } from './string-character-stream.class';
import { Token } from './token.class';
import { TokenType } from './token-type.enum';
import { LexError } from './lex-error.class';

export class DiceLexer implements Lexer {
  protected stream: CharacterStream;
  private currentToken: Token;
  private nextToken: Token;

  // `d10...3` should roll a d10 3 times. After parsing `10` we don't know
  // whether the period is part of the number (ex: `10.3`) or is part of an
  // ellipsis so we consume it and check. If we see that it's not a decimal
  // point in a number (ie: there's not a number following it) we'll emit the
  // number and then set this to true so we know we're in the middle of
  // consuming an ellipsis.
  private partialEllipsisConsumed: boolean = false;

  private numCharRegex: RegExp = /[0-9]/;
  private idCharRegex: RegExp = /[a-zA-Z]/;

  constructor(input: CharacterStream | string) {
    if (this.isCharacterStream(input)) {
      this.stream = input;
    } else if (typeof input === 'string') {
      this.stream = new StringCharacterStream(input);
    } else {
      throw new Error('Unrecognized input type. input must be of type \'CharacterStream | string\'.');
    }
  }

  private isCharacterStream(input: any): input is CharacterStream {
    return input.getCurrentCharacter;
  }

  public peekNextToken(): Token {
    if (!this.nextToken) {
      this.nextToken = this.constructNextToken();
    }
    return this.nextToken;
  }

  public getNextToken(): Token {
    if (this.nextToken) {
      this.currentToken = this.nextToken;
      this.nextToken = null;
    } else {
      this.currentToken = this.constructNextToken();
    }
    return this.currentToken;
  }

  protected parseIdentifier(): Token {
    let buffer = this.stream.getCurrentCharacter();
    // TODO: klnull?!
    while (this.stream.peekNextCharacter() && this.idCharRegex.test(this.stream.peekNextCharacter())) {
      buffer += this.stream.getNextCharacter();
    }
    return this.createToken(TokenType.Identifier, buffer);
  }

  protected parseNumber(): Token {
    let buffer = this.stream.getCurrentCharacter();
    let hasDot = false;
    let nextChar = this.stream.peekNextCharacter();
    while (nextChar === '.' || this.numCharRegex.test(nextChar)) {
      if (nextChar === '.') {
        if (hasDot) { break; }
        hasDot = true;
      }
      buffer += this.stream.getNextCharacter();
      nextChar = this.stream.peekNextCharacter();
    }

    if (buffer.endsWith(".")) {
      buffer = buffer.slice(0, -1);
      this.partialEllipsisConsumed = true;
    }

    return this.createToken(TokenType.Number, buffer);
  }

  protected parseEllipsis(): Token {
    this.partialEllipsisConsumed = false;

    for (let x = 0; x < 2; x++) {
      if (this.stream.getNextCharacter() !== '.') {
        throw LexError.fromStream(this.stream, 'Missing period in ellipsis.');
      }
    }
    return this.createToken(TokenType.Ellipsis, '...');
  }

  private constructNextToken() {
    if (this.partialEllipsisConsumed) return this.parseEllipsis();

    let curChar: string;
    while (curChar = this.stream.getNextCharacter()) {
      switch (true) {
        case this.idCharRegex.test(curChar): return this.parseIdentifier();
        case this.numCharRegex.test(curChar): return this.parseNumber();
        case curChar === '{': return this.createToken(TokenType.BraceOpen, curChar);
        case curChar === '}': return this.createToken(TokenType.BraceClose, curChar);
        case curChar === ',': return this.createToken(TokenType.Comma, curChar);
        case curChar === '(': return this.createToken(TokenType.ParenthesisOpen, curChar);
        case curChar === ')': return this.createToken(TokenType.ParenthesisClose, curChar);
        case curChar === '\\': return this.createToken(TokenType.Comment, curChar);
        case curChar === '=': return this.createToken(TokenType.Equals, curChar);
        case curChar === '+': return this.createToken(TokenType.Plus, curChar);
        case curChar === '/': return this.createToken(TokenType.Slash, curChar);
        case curChar === '-': return this.createToken(TokenType.Minus, curChar);
        case curChar === '%': return this.createToken(TokenType.Percent, curChar);
        case curChar === '!': return this.createToken(TokenType.Exclamation, curChar);
        case curChar === '.': return this.parseEllipsis();
        case curChar === '*':
          if (this.stream.peekNextCharacter() === '*') {
            this.stream.getNextCharacter();
            return this.createToken(TokenType.DoubleAsterisk, curChar + this.stream.getCurrentCharacter());
          } else {
            return this.createToken(TokenType.Asterisk, curChar);
          }
        case curChar === '>':
          return this.createToken(TokenType.GreaterOrEqual, curChar);
        case curChar === '<':
          return this.createToken(TokenType.LessOrEqual, curChar);
        case /\s/.test(curChar):
          // Ignore whitespace.
          break;
        default: throw LexError.fromStream(this.stream, "Unknown character.");
      }
    }
    // Terminator at end of stream.
    return this.createToken(TokenType.Terminator);
  }

  private createToken(type: TokenType, value?: string): Token {
    let position = this.stream.getCurrentPosition();
    if (value) { position -= value.length - 1; }
    return new Token(type, position, value);
  }
}
