import { ExpressionNode } from '../ast';
import { DiceInterpreter } from './dice-interpreter.class';
import { InterpreterErrorMessage } from './error-message.class';

export type FunctionDefinition = (interpreter: DiceInterpreter, functionNode: ExpressionNode, errors: InterpreterErrorMessage[]) => number;
