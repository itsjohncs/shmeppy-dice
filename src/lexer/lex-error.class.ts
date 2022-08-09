export class LexError extends Error {
    constructor(public character: string, public position: number) {
        super(`Unknown character "${character}" at position ${position}.`);
    }
}
