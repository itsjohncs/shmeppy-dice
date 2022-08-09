import * as Ast from '../ast';
import { ParseErrorMessage } from './error-message.class';

export class ParseResult {
  root: Ast.ExpressionNode;
  errors: ParseErrorMessage[] = [];
}
