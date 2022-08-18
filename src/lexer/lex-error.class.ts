import { CharacterStream } from "./character-stream.interface";

export class LexError extends Error {
    constructor(public character: string | null, public position: number, public detail: string) {
        let description: string;
        if (character === null) {
            description = `Unexpected end of input: ${detail}`;
        } else {
            description = `Unexpected character "${character} at position ${position}: ${detail}"`;
        }

        super(description);
    }

    static fromStream(stream: CharacterStream, detail: string) {
        return new LexError(stream.getCurrentCharacter(), stream.getCurrentPosition(), detail);
    }
}
