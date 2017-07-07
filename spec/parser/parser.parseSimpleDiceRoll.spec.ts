import { NodeType } from "../../src/ast/node-type";
import { Token, TokenType } from "../../src/lexer";
import * as Parser from "../../src/parser";
import { MockLexer } from "../helpers/mock-lexer";

describe("Parser", () => {
    describe("parseSimpleDiceRoll", () => {
        it("can correctly parse a simple dice roll", () => {
            const lexer = new MockLexer([
                new Token(TokenType.NumberInteger, "10"),
                new Token(TokenType.Identifier, "d"),
                new Token(TokenType.NumberInteger, "6")
            ]);
            const parser = new Parser.Parser(lexer);
            const num = parser.parseInteger();
            const dice = parser.parseSimpleDiceRoll(num);
            expect(dice.type).toBe(NodeType.Dice);
            expect(dice.getChildCount()).toBe(2);
            expect(dice.getChild(0).type).toBe(NodeType.Integer);
            expect(dice.getChild(0).getAttribute("value")).toBe("10");
            expect(dice.getChild(1).type).toBe(NodeType.DiceSides);
            expect(dice.getChild(1).getAttribute("value")).toBe("6");
        });
        it("can correctly parse a simple dice roll with pre-parsed number", () => {
            const lexer = new MockLexer([
                new Token(TokenType.NumberInteger, "10"),
                new Token(TokenType.Identifier, "d"),
                new Token(TokenType.NumberInteger, "6")
            ]);
            const parser = new Parser.Parser(lexer);
            const dice = parser.parseSimpleDiceRoll();
            expect(dice.type).toBe(NodeType.Dice);
            expect(dice.getChildCount()).toBe(2);
            expect(dice.getChild(0).type).toBe(NodeType.Integer);
            expect(dice.getChild(0).getAttribute("value")).toBe("10");
            expect(dice.getChild(1).type).toBe(NodeType.DiceSides);
            expect(dice.getChild(1).getAttribute("value")).toBe("6");
        });
        it("can correctly parse a simple fate dice roll", () => {
            const lexer = new MockLexer([
                new Token(TokenType.NumberInteger, "10"),
                new Token(TokenType.Identifier, "dF")
            ]);
            const parser = new Parser.Parser(lexer);
            const dice = parser.parseSimpleDiceRoll();
            expect(dice.type).toBe(NodeType.Dice);
            expect(dice.getChildCount()).toBe(2);
            expect(dice.getChild(0).type).toBe(NodeType.Integer);
            expect(dice.getChild(0).getAttribute("value")).toBe("10");
            expect(dice.getChild(1).type).toBe(NodeType.DiceSides);
            expect(dice.getChild(1).getAttribute("value")).toBe("fate");
        });
        it("can correctly parse a dice roll with a bracketed number", () => {
            const lexer = new MockLexer([
                new Token(TokenType.ParenthesisOpen, "("),
                new Token(TokenType.NumberInteger, "10"),
                new Token(TokenType.ParenthesisClose, ")"),
                new Token(TokenType.Identifier, "d"),
                new Token(TokenType.NumberInteger, "6")
            ]);
            const parser = new Parser.Parser(lexer);
            const dice = parser.parseSimpleDiceRoll();
            expect(dice.type).toBe(NodeType.Dice);
            expect(dice.getChildCount()).toBe(2);
            expect(dice.getChild(0).type).toBe(NodeType.Integer);
            expect(dice.getChild(0).getAttribute("value")).toBe("10");
            expect(dice.getChild(1).type).toBe(NodeType.DiceSides);
            expect(dice.getChild(1).getAttribute("value")).toBe("6");
        });
        it("can correctly parse a dice roll with a bracketed expression", () => {
            const lexer = new MockLexer([
                new Token(TokenType.ParenthesisOpen, "("),
                new Token(TokenType.NumberInteger, "10"),
                new Token(TokenType.MathOpAdd, "+"),
                new Token(TokenType.NumberInteger, "3"),
                new Token(TokenType.ParenthesisClose, ")"),
                new Token(TokenType.Identifier, "d"),
                new Token(TokenType.NumberInteger, "6")
            ]);
            const parser = new Parser.Parser(lexer);
            const dice = parser.parseSimpleDiceRoll();
            expect(dice.type).toBe(NodeType.Dice);
            expect(dice.getChildCount()).toBe(2);
            expect(dice.getChild(0).type).toBe(NodeType.Add);
            expect(dice.getChild(0).getChildCount()).toBe(2);
            expect(dice.getChild(0).getChild(0).type).toBe(NodeType.Integer);
            expect(dice.getChild(0).getChild(0).getAttribute("value")).toBe("10");
            expect(dice.getChild(0).getChild(1).type).toBe(NodeType.Integer);
            expect(dice.getChild(0).getChild(1).getAttribute("value")).toBe("3");
            expect(dice.getChild(1).type).toBe(NodeType.DiceSides);
            expect(dice.getChild(1).getAttribute("value")).toBe("6");
        });
         it("throws on missing roll times", () => {
            const lexer = new MockLexer([
                new Token(TokenType.Identifier, "d"),
                new Token(TokenType.NumberInteger, "10")
            ]);
            const parser = new Parser.Parser(lexer);
            expect(() => parser.parseSimpleDiceRoll()).toThrow();
        });
        it("throws on missing dice value", () => {
            const lexer = new MockLexer([
                new Token(TokenType.NumberInteger, "6"),
                new Token(TokenType.Identifier, "d")
            ]);
            const parser = new Parser.Parser(lexer);
            expect(() => parser.parseSimpleDiceRoll()).toThrow();
        });
    });
});