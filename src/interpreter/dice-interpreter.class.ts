import * as Ast from '../ast';
import { DiceGenerator } from '../generator';
import { DefaultRandomProvider, RandomProvider } from '../random';
import { DefaultFunctionDefinitions } from './default-function-definitions';
import { DiceResult } from './dice-result.class';
import { InterpreterErrorMessage } from './error-message.class';
import { FunctionDefinitionList } from './function-definition-list.class';
import { Interpreter } from './interpreter.interface';
import { InterpreterOptions } from './interpreter-options.interface';

interface SortedDiceRolls {
  rolls: Ast.ExpressionNode[];
  total: number;
}

export class DiceInterpreter implements Interpreter<DiceResult> {
  functions: FunctionDefinitionList;
  random: RandomProvider;
  generator: DiceGenerator;
  options: InterpreterOptions;

  constructor(functions?: FunctionDefinitionList, random?: RandomProvider, generator?: DiceGenerator, options?: InterpreterOptions) {
    this.functions = DefaultFunctionDefinitions;
    (<any>Object).assign(this.functions, functions);
    this.random = random || new DefaultRandomProvider();
    this.generator = generator || new DiceGenerator();
    this.options = options || {};
  }

  interpret(expression: Ast.ExpressionNode): DiceResult {
    const exp = expression.copy();
    const errors: InterpreterErrorMessage[] = [];
    const total = this.evaluate(exp, errors);
    const successes = this.countSuccesses(exp, errors);
    const fails = this.countFailures(exp, errors);
    const renderedExpression = this.generator.generate(exp);
    return new DiceResult(exp, renderedExpression, total, this.random.getInitialSeed(), successes, fails, errors);
  }

  evaluate(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): any {
    if (!expression) { errors.push(new InterpreterErrorMessage('Unexpected null node reference found.', expression)); return 0; }
    if (expression.type === Ast.NodeType.DiceRoll) {
      return this.evaluateDiceRoll(expression, errors);
    } else if (expression.type === Ast.NodeType.Number) {
      return this.evaluateNumber(expression, errors);
    } else if (expression.type === Ast.NodeType.DiceSides) {
      return this.evaluateDiceSides(expression, errors);
    } else if (!expression.getAttribute('value')) {
      let value: any = 0;
      switch (expression.type) {
        case Ast.NodeType.Add: value = this.evaluateAdd(expression, errors); break;
        case Ast.NodeType.Subtract: value = this.evaluateSubtract(expression, errors); break;
        case Ast.NodeType.Multiply: value = this.evaluateMultiply(expression, errors); break;
        case Ast.NodeType.Divide: value = this.evaluateDivide(expression, errors); break;
        case Ast.NodeType.Modulo: value = this.evaluateModulo(expression, errors); break;
        case Ast.NodeType.Negate: value = this.evaluateNegate(expression, errors); break;
        case Ast.NodeType.Exponent: value = this.evaluateExponent(expression, errors); break;
        case Ast.NodeType.Dice: value = this.evaluateDice(expression, errors); break;
        case Ast.NodeType.Function: value = this.evaluateFunction(expression, errors); break;
        case Ast.NodeType.Group: value = this.evaluateGroup(expression, errors); break;
        case Ast.NodeType.Repeat: value = this.evaluateRepeat(expression, errors); break;
        case Ast.NodeType.Explode: value = this.evaluateExplode(expression, errors); break;
        case Ast.NodeType.Keep: value = this.evaluateKeep(expression, errors); break;
        case Ast.NodeType.Drop: value = this.evaluateDrop(expression, errors); break;
        case Ast.NodeType.Critical: value = this.evaluateCritical(expression, errors); break;
        case Ast.NodeType.Reroll: value = this.evaluateReroll(expression, errors); break;
        case Ast.NodeType.Sort: value = this.evaluateSort(expression, errors); break;
        case Ast.NodeType.Equal: value = this.evaluateEqual(expression, errors); break;
        case Ast.NodeType.Greater: value = this.evaluateGreater(expression, errors); break;
        case Ast.NodeType.GreaterOrEqual: value = this.evaluateGreaterOrEqual(expression, errors); break;
        case Ast.NodeType.Less: value = this.evaluateLess(expression, errors); break;
        case Ast.NodeType.LessOrEqual: value = this.evaluateLessOrEqual(expression, errors); break;
        default:
          errors.push(new InterpreterErrorMessage(`Unrecognized node type '${expression.type}'.`, expression));
          return 0;
      }
      expression.setAttribute('value', value);
    }
    return expression.getAttribute('value');
  }

  evaluateAdd(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 2, errors)) { return 0; }
    return this.evaluate(expression.getChild(0), errors) + this.evaluate(expression.getChild(1), errors);
  }

  evaluateSubtract(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 2, errors)) { return 0; }
    return this.evaluate(expression.getChild(0), errors) - this.evaluate(expression.getChild(1), errors);
  }

  evaluateMultiply(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 2, errors)) { return 0; }
    return this.evaluate(expression.getChild(0), errors) * this.evaluate(expression.getChild(1), errors);
  }

  evaluateDivide(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 2, errors)) { return 0; }
    return this.evaluate(expression.getChild(0), errors) / this.evaluate(expression.getChild(1), errors);
  }

  evaluateModulo(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 2, errors)) { return 0; }
    return this.evaluate(expression.getChild(0), errors) % this.evaluate(expression.getChild(1), errors);
  }

  evaluateExponent(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 2, errors)) { return 0; }
    return Math.pow(this.evaluate(expression.getChild(0), errors), this.evaluate(expression.getChild(1), errors));
  }

  evaluateNegate(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 1, errors)) { return 0; }
    return -this.evaluate(expression.getChild(0), errors);
  }

  evaluateNumber(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    return expression.getAttribute('value');
  }

  evaluateDiceSides(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    return expression.getAttribute('value');
  }

  evaluateDiceRoll(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (expression.getAttribute('drop') !== true) {
      return expression.getAttribute('value');
    }
    return 0;
  }

  evaluateDice(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 2, errors)) { return 0; }
    const num = Math.round(this.evaluate(expression.getChild(0), errors));
    const { maxRollTimes, maxDiceSides } = this.options;
    if (maxRollTimes && num > maxRollTimes) {
      errors.push(new InterpreterErrorMessage(`Invalid number of rolls: ${num}. Maximum allowed: ${maxRollTimes}.`, expression));
      return null;
    }

    const sides = expression.getChild(1);
    const sidesValue = this.evaluate(sides, errors);
    if (maxDiceSides && sidesValue > maxDiceSides) {
      errors.push(new InterpreterErrorMessage(`Invalid number of dice sides: ${sidesValue}. Maximum allowed: ${maxDiceSides}.`, expression));
      return null;
    }
    expression.setAttribute('sides', sidesValue);

    expression.clearChildren();

    let total = 0;
    for (let x = 0; x < num; x++) {
      const diceRoll = this.createDiceRoll(sides, errors);
      expression.addChild(diceRoll);
      total += this.evaluate(diceRoll, errors);
    }
    return total;
  }

  evaluateFunction(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    const fName = expression.getAttribute('name');
    if (Object.keys(this.functions).indexOf(fName) === -1) {
      errors.push(new InterpreterErrorMessage(`Unknown function: ${fName}`, expression));
      return 0;
    }
    const result = this.functions[fName](this, expression, errors);
    return result;
  }

  evaluateGroup(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    let total = 0;
    expression.forEachChild(child => {
      total += this.evaluate(child, errors);
    });
    return total;
  }

  evaluateRepeat(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 2, errors)) { return 0; }
    const lhs = expression.getChild(0);
    const times = this.evaluate(expression.getChild(1), errors);

    const parent = expression.getParent();
    parent.removeChild(expression);

    let total = 0;
    for (let x = 0; x < times; x++) {
      const copy = lhs.copy();
      parent.addChild(copy);
      total += this.evaluate(copy, errors);
    }
    return total;
  }

  evaluateExplode(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 1, errors)) { return 0; }
    const dice = this.findDiceOrGroupNode(expression, errors);
    if (!dice) { return 0; }
    const penetrate = expression.getAttribute('penetrate');

    const sides = dice.getAttribute('sides');

    let condition: Ast.ExpressionNode;
    if (expression.getChildCount() > 1) {
      condition = expression.getChild(1);
      if (this.wouldRollAgainForever(dice, condition, errors)) {
        return 0;
      }
    } else {
      condition = Ast.Factory.create(Ast.NodeType.Equal);
      condition.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', sides));
    }

    this.evaluate(dice, errors);

    const newRolls: Ast.ExpressionNode[] = [];
    let total = 0;

    dice.forEachChild(die => {
      if (!die.getAttribute('drop')) {
        let dieValue = this.evaluate(die, errors);
        total += dieValue;
        while (condition && this.evaluateComparison(dieValue, condition, errors)) {
          die = this.createDiceRoll(sides, errors);
          dieValue = this.evaluate(die, errors);
          if (penetrate) { dieValue -= 1; }
          total += dieValue;
          newRolls.push(die);
        }
      }
    });

    newRolls.forEach(newRoll => dice.addChild(newRoll));
    return total;
  }

  evaluateKeep(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 1, errors)) { return 0; }
    const dice = this.findDiceOrGroupNode(expression, errors);
    if (!dice) { return 0; }
    const countTotal = (expression.getChildCount() > 1) ? this.evaluate(expression.getChild(1), errors) : 1;
    const type = expression.getAttribute('type');
    this.evaluate(dice, errors);

    const rolls = this.getSortedDiceRolls(dice, (type === 'lowest') ? 'ascending' : 'descending', errors).rolls;

    let count = 0;
    let total = 0;
    rolls.forEach(roll => {
      if (count < countTotal) {
        roll.setAttribute('drop', false);
        total += roll.getAttribute('value');
      } else {
        roll.setAttribute('drop', true);
      }
      count++;
    });
    return total;
  }

  evaluateDrop(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 1, errors)) { return 0; }
    const dice = this.findDiceOrGroupNode(expression, errors);
    if (!dice) { return 0; }
    const countTotal = (expression.getChildCount() > 1) ? this.evaluate(expression.getChild(1), errors) : 1;
    const type = expression.getAttribute('type');
    this.evaluate(dice, errors);

    const rolls = this.getSortedDiceRolls(dice, (type === 'lowest') ? 'ascending' : 'descending', errors).rolls;
    let count = 0;
    let total = 0;
    rolls.forEach(roll => {
      if (count < countTotal) {
        roll.setAttribute('drop', true);
      } else {
        roll.setAttribute('drop', false);
        total += roll.getAttribute('value');
      }
      count++;
    });
    return total;
  }

  evaluateCritical(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 1, errors)) { return 0; }
    const dice = this.findDiceOrGroupNode(expression, errors);
    if (!dice) { return 0; }
    const type = expression.getAttribute('type');

    let condition: Ast.ExpressionNode;
    if (expression.getChildCount() > 1) {
      condition = expression.getChild(1);
    } else {
      condition = Ast.Factory.create(Ast.NodeType.Equal);
      if (type === 'success') {
        this.expectChildCount(dice, 2, errors);
        condition.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', dice.getAttribute('sides')));
      } else {
        condition.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 1));
      }
    }

    this.evaluate(dice, errors);

    let total = 0;
    dice.forEachChild((die) => {
      const dieValue = this.evaluate(die, errors);
      if (this.evaluateComparison(dieValue, condition, errors)) {
        die.setAttribute('critical', type);
        total += dieValue;
      }
    });

    return total;
  }

  evaluateReroll(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 1, errors)) { return 0; }
    const dice = this.findDiceOrGroupNode(expression, errors);
    if (!dice) { return 0; }
    let condition: Ast.ExpressionNode;
    const once = expression.getAttribute('once');

    if (expression.getChildCount() > 1) {
      condition = expression.getChild(1);
      if (this.wouldRollAgainForever(dice, condition, errors)) {
        return 0;
      }
    } else {
      condition = Ast.Factory.create(Ast.NodeType.Equal);
      condition.addChild(Ast.Factory.create(Ast.NodeType.Number).setAttribute('value', 1));
    }

    this.evaluate(dice, errors);

    let total = 0;
    const sides = dice.getAttribute('sides');
    dice.forEachChild(die => {
      if (!die.getAttribute('drop')) {
        let dieValue = this.evaluate(die, errors);
        while (condition && this.evaluateComparison(dieValue, condition, errors)) {
          dieValue = this.createDiceRollValue(sides, errors);
          if (once) { break; }
        }
        die.setAttribute('value', dieValue);
        total += dieValue;
      }
    });

    return total;
  }

  evaluateSort(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 1, errors)) { return 0; }
    const dice = this.findDiceOrGroupNode(expression, errors);
    if (!dice) { return 0; }
    const rolls = this.getSortedDiceRolls(dice, expression.getAttribute('direction'), errors);
    dice.clearChildren();
    rolls.rolls.forEach(roll => dice.addChild(roll));
    return rolls.total;
  }

  evaluateEqual(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    return this.evaluateSuccess(expression, (l, r) => (l === r), errors);
  }

  evaluateGreater(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    return this.evaluateSuccess(expression, (l, r) => (l > r), errors);
  }

  evaluateGreaterOrEqual(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    return this.evaluateSuccess(expression, (l, r) => (l >= r), errors);
  }

  evaluateLess(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    return this.evaluateSuccess(expression, (l, r) => (l < r), errors);
  }

  evaluateLessOrEqual(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    return this.evaluateSuccess(expression, (l, r) => (l <= r), errors);
  }

  countSuccesses(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    return this.countSuccessOrFailure(expression, die => die.getAttribute('success'), errors);
  }

  countFailures(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): number {
    return this.countSuccessOrFailure(expression, die => die.getAttribute('success') === false, errors);
  }

  private countSuccessOrFailure(expression: Ast.ExpressionNode,
    condition: (die: Ast.ExpressionNode) => boolean, errors: InterpreterErrorMessage[]): number {
    let total = 0;
    if (expression.type === Ast.NodeType.Dice || expression.type === Ast.NodeType.Group) {
      expression.forEachChild(die => {
        if (!die.getAttribute('drop') && condition(die)) { total++; }
      });
    } else {
      expression.forEachChild(die => {
        total += this.countSuccessOrFailure(die, condition, errors);
      });
    }
    return total;
  }

  private expectChildCount(expression: Ast.ExpressionNode, count: number, errors: InterpreterErrorMessage[]): boolean {
    const findCount = expression.getChildCount();
    if (findCount < count) {
      const err = new InterpreterErrorMessage(`Expected ${expression.type} node to have ${count} children, but found ${findCount}.`, expression);
      errors.push(err);
      return false;
    }
    return true;
  }

  private evaluateComparison(lhs: number, expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): boolean {
    if (!this.expectChildCount(expression, 1, errors)) { return false; }
    switch (expression.type) {
      case Ast.NodeType.Equal: return lhs === this.evaluate(expression.getChild(0), errors);
      case Ast.NodeType.Greater: return lhs > this.evaluate(expression.getChild(0), errors);
      case Ast.NodeType.GreaterOrEqual: return lhs >= this.evaluate(expression.getChild(0), errors);
      case Ast.NodeType.Less: return lhs < this.evaluate(expression.getChild(0), errors);
      case Ast.NodeType.LessOrEqual: return lhs <= this.evaluate(expression.getChild(0), errors);
      default:
        errors.push(new InterpreterErrorMessage(`Unrecognized comparison operator '${expression.type}'.`, expression));
        return false;
    }
  }

  evaluateSuccess(expression: Ast.ExpressionNode, compare: (lhs: number, rhs: number) => boolean, errors: InterpreterErrorMessage[]): number {
    if (!this.expectChildCount(expression, 2, errors)) { return 0; }
    const rhv = this.evaluate(expression.getChild(1), errors);

    let total = 0;
    const diceOrGroup = this.findDiceOrGroupNode(expression, errors);
    if (!diceOrGroup) { return 0; }
    diceOrGroup.forEachChild(die => {
      if (!die.getAttribute('drop')) {
        const val = this.evaluate(die, errors);
        const res = compare(this.evaluate(die, errors), rhv);
        die.setAttribute('success', res);
        if (res) { total += val; }
      }
    });

    return total;
  }

  private findDiceOrGroupNode(expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): Ast.ExpressionNode {
    if (expression.type === Ast.NodeType.Dice || expression.type === Ast.NodeType.Group) {
      return expression;
    }
    if (expression.getChildCount() < 1) {
      errors.push(new InterpreterErrorMessage('Missing dice/group node.', expression));
      return null;
    }
    const child = expression.getChild(0);
    this.evaluate(child, errors);
    return this.findDiceOrGroupNode(child, errors);
  }

  private getSortedDiceRolls(dice: Ast.ExpressionNode, direction: string, errors: InterpreterErrorMessage[]): SortedDiceRolls {
    const output: SortedDiceRolls = { rolls: [], total: 0 };

    dice.forEachChild(die => {
      output.rolls.push(die);
      output.total += this.evaluate(die, errors);
    });

    let sortOrder;
    if (direction === 'descending') {
      sortOrder = (a, b) => b.getAttribute('value') - a.getAttribute('value');
    } else if (direction === 'ascending') {
      sortOrder = (a, b) => a.getAttribute('value') - b.getAttribute('value');
    } else {
      errors.push(new InterpreterErrorMessage(`Unknown sort direction: ${direction}. Expected 'ascending' or 'descending'.`, dice));
    }

    output.rolls = output.rolls.sort(sortOrder);
    return output;
  }

  private createDiceRoll(sides: Ast.ExpressionNode | number, errors: InterpreterErrorMessage[]): Ast.ExpressionNode {
    const sidesValue = sides instanceof Ast.ExpressionNode
      ? sides.getAttribute('value')
      : sides;
    const diceRoll = this.createDiceRollValue(sides, errors);
    return Ast.Factory.create(Ast.NodeType.DiceRoll)
      .setAttribute('value', diceRoll)
      .setAttribute('drop', false);
  }

  private createDiceRollValue(sides: Ast.ExpressionNode | number, errors: InterpreterErrorMessage[]): number {
    let minValue = 1, maxValue = 0;

    const sidesValue = sides instanceof Ast.ExpressionNode
      ? sides.getAttribute('value')
      : sides;

    if (sidesValue === 'fate') {
      minValue = -1; maxValue = 1;
    } else {
      maxValue = Math.round(sides instanceof Ast.ExpressionNode ? this.evaluate(sides, errors) : sides);
    }
    return this.random.numberBetween(minValue, maxValue);
  }

  private wouldRollAgainForever(dice: Ast.ExpressionNode, expression: Ast.ExpressionNode, errors: InterpreterErrorMessage[]): boolean {
    const sides = dice.getAttribute('sides');
    const value = expression.getChild(0).getAttribute('value');
    let wouldRunForever = false;
    switch (expression.type) {
      case Ast.NodeType.Equal: wouldRunForever = sides === 1 && value === 1; break;
      case Ast.NodeType.Greater: wouldRunForever = value < 1; break;
      case Ast.NodeType.GreaterOrEqual: wouldRunForever = value <= 1; break;
      case Ast.NodeType.Less: wouldRunForever = value > sides; break;
      case Ast.NodeType.LessOrEqual: wouldRunForever = value >= sides;
    }

    if (wouldRunForever) {
      errors.push(new InterpreterErrorMessage('Condition to roll again includes all dice faces and would run forever.', expression));
    }

    return wouldRunForever;
  }
}
