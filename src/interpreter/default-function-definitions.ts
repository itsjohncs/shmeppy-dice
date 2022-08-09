import * as Ast from '../ast';
import { InterpreterError } from './error-message.class';
import { FunctionDefinitionList } from './function-definition-list.class';
import { DiceInterpreter } from './dice-interpreter.class';

export const DefaultFunctionDefinitions = new FunctionDefinitionList();

DefaultFunctionDefinitions['floor'] = (interpreter, functionNode, errors) => {
  return Math.floor(interpreter.evaluate(functionNode.getChild(0), errors));
};

DefaultFunctionDefinitions['ceil'] = (interpreter, functionNode, errors) => {
  return Math.ceil(interpreter.evaluate(functionNode.getChild(0), errors));
};

DefaultFunctionDefinitions['abs'] = (interpreter, functionNode, errors) => {
  return Math.abs(interpreter.evaluate(functionNode.getChild(0), errors));
};

DefaultFunctionDefinitions['round'] = (interpreter, functionNode, errors) => {
  return Math.round(interpreter.evaluate(functionNode.getChild(0), errors));
};

DefaultFunctionDefinitions['sqrt'] = (interpreter, functionNode, errors) => {
  return Math.sqrt(interpreter.evaluate(functionNode.getChild(0), errors));
};

class DblDiceInterpreterProxyHandler implements ProxyHandler<DiceInterpreter> {
  static evaluateDiceStub(this: DiceInterpreter, target: DiceInterpreter,
      expression: Ast.ExpressionNode, errors: InterpreterError[]): number {
    return target.evaluateDice(expression, errors) * 2;
  }

  get(target: DiceInterpreter, p: PropertyKey, receiver: any): any {
    if (p === 'evaluateDice') {
      return DblDiceInterpreterProxyHandler.evaluateDiceStub.bind(this, target);
    }

    return target[p];
  }
}

const dblDiceInterpreterProxyHandler = new DblDiceInterpreterProxyHandler();

DefaultFunctionDefinitions['dbldice'] = (interpreter, functionNode, errors) => {
  const proxiedInterpreter = new Proxy(interpreter, dblDiceInterpreterProxyHandler);
  return proxiedInterpreter.evaluate(functionNode.getChild(0), errors);
};

DefaultFunctionDefinitions['seed'] = (interpreter, functionNode, errors) => {
  const seed = interpreter.evaluate(functionNode.getChild(1), errors);
  const oldRandom = interpreter.random;

  interpreter.random = oldRandom.newFromSeed(seed);
  try {
    return interpreter.evaluate(functionNode.getChild(0), errors);
  } finally {
    interpreter.random = oldRandom;
  }
};
