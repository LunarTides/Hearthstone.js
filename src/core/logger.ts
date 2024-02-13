export class Logger {
    debugLog: string[] = [];

    log = console.log;
    warn = console.warn;
    error = console.error;

    debug(...data: any) {
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
}
