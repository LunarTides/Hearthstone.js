export const logger = {
	debugLog: [] as string[],

	/**
	 * @example
	 * game.logger.debug("Starting...");
	 * assert.equal(game.logger.debugLog[0], "Starting...");
	 * game.logger.debug("Something else");
	 * assert.equal(game.logger.debugLog[1], "Something else");
	 *
	 * game.logger.debug("Starting...OK");
	 * assert.equal(game.logger.debugLog[0], "Starting...OK");
	 * assert.equal(game.logger.debugLog[1], "Something else");
	 */
	debug(...data: string[]): void {
		for (const string of data) {
			if (typeof string !== "string") {
				continue;
			}

			const split = `${string.split("...")[0]}...`;

			if (this.debugLog.includes(split)) {
				this.debugLog.splice(this.debugLog.indexOf(split), 1, string);

				game.functions.util.remove(data, string);
			}
		}

		this.debugLog.push(...data);
	},

	translate(text: string, ...args: unknown[]): string {
		return game.functions.util.translate(text, ...args);
	},

	logTranslate(text: string, ...args: unknown[]): void {
		console.log(this.translate(text, ...args));
	},

	async inputTranslate(text: string, ...args: unknown[]): Promise<string> {
		const newText = this.translate(text, ...args);

		return await game.input(newText);
	},

	async inputTranslateWithOptions(
		text: string,
		overrideNoInput = false,
		useInputQueue = true,
		...args: unknown[]
	): Promise<string> {
		const newText = this.translate(text, ...args);

		return await game.input(newText, overrideNoInput, useInputQueue);
	},

	async pauseTranslate(text: string, ...args: unknown[]): Promise<void> {
		await game.pause(this.translate(text, ...args));
	},
};
