export const errorFunctions = {
    /**
     * Returns an AI Error with the provided information.
     *
     * @param code The function where the error occurred.
     * @param expected The expected value.
     * @param actual The actual value.
     * 
     * @returns The AI Error with the provided information.
     */
    AIError(code: string, expected: any, actual: any): Error {
        return new Error(`AI Error: expected: ${expected}, got: ${actual}. Error Code: ${code}`);
    },

    /**
     * If the callback returns a falsy value, throw an Error.
     */
    assert(callback: () => boolean) {
        if (callback()) return;

        throw new Error(`Assertion failed at: ${callback.toString().replace("() => ", "")}`);
    },
}
