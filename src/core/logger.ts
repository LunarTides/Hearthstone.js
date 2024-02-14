export class Logger {
    debugLog: string[] = [];

    log = console.log;
    warn = console.warn;
    error = console.error;

    input = game.input;
    pause = game.pause;

    debug(...data: any): void {
        /*
         * Example:
         * logger.debug("Starting...");
         * assert.equal(logger.debugLog[0], "Starting...");
         * logger.debug("Something else");
         * assert.equal(logger.debugLog[1], "Something else");
         *
         * logger.debug("Starting...OK");
         * assert.equal(logger.debugLog[0], "Starting...OK");
         * assert.equal(logger.debugLog[1], "Something else");
         */
        for (const string of data) {
            if (typeof string !== 'string') {
                continue;
            }

            const split = string.split('...')[0] + '...';

            if (this.debugLog.includes(split)) {
                this.debugLog.splice(this.debugLog.indexOf(split), 1, string);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                game.functions.util.remove(data, string);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.debugLog.push(...data);
    }

    translate(text: string, ...args: any[]): string {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return game.functions.util.translate(text, ...args);
    }

    logTranslate(text: string, ...args: any[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.log(this.translate(text, ...args));
    }

    inputTranslate(text: string, ...args: any[]): string {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        text = this.translate(text, ...args);

        return game.input(text);
    }

    inputTranslateWithOptions(text: string, overrideNoInput = false, useInputQueue = true, ...args: any[]): string {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        text = this.translate(text, ...args);

        return game.input(text, overrideNoInput, useInputQueue);
    }

    pauseTranslate(text: string, ...args: any[]): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        game.pause(this.translate(text, ...args));
    }
}
