import readline from "node:readline/promises";
import { format } from "node:util";
import { type Ai, Card, commands, debugCommands } from "@Game/internal.js";
import type { GamePlayCardReturn, Target } from "@Game/types.js";
import { parseTags } from "chalk-tags";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const overrideConsole = {
	log: console.log.bind(console),
	warn: console.warn.bind(console),
	error: console.error.bind(console),
};

console.log = (...data) => {
	game.interact.gameLoop.log(...data);
};

console.warn = (...data) => {
	game.interact.gameLoop.logWarn(...data);
};

console.error = (...data) => {
	game.interact.gameLoop.logError(...data);
};

export const gameloopInteract = {
	/**
	 * Ask the user a question and returns their answer
	 *
	 * @param q The question to ask
	 * @param overrideNoInput If this is true, it overrides `game.noInput`. Only use this when debugging.
	 * @param useInputQueue If it should use the player's input queue
	 *
	 * @returns What the user answered
	 */
	async input(
		q = "",
		overrideNoInput = false,
		useInputQueue = true,
	): Promise<string> {
		let question = q;

		const wrapper = async (a: string) => {
			await game.event.broadcast("Input", a, game.player);
			return a;
		};

		if (game.noOutput) {
			question = "";
		}

		if (game.noInput && !overrideNoInput) {
			return wrapper("");
		}

		question = logger.translate(question);
		question = parseTags(question);

		// Let the game make choices for the user
		if (game.player.inputQueue && useInputQueue) {
			const queue = game.player.inputQueue;

			if (typeof queue === "string") {
				return wrapper(queue);
			}

			// Invalid queue
			if (!Array.isArray(queue)) {
				return wrapper(await rl.question(question));
			}

			const answer = queue[0];
			queue.splice(0, 1);

			if (queue.length <= 0) {
				game.player.inputQueue = undefined;
			}

			return wrapper(answer);
		}

		return wrapper(await rl.question(question));
	},

	/**
	 * Helper function for the `console.log` functions. Don't use.
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	logWrapper(callback: (...data: any) => void, ...data: any): void {
		if (game.noOutput) {
			return;
		}

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const newData = data.map((i: any) =>
			typeof i === "string" ? parseTags(logger.translate(i)) : i,
		);

		callback(...newData);
	},

	/**
	 * Wrapper for console.log
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	log(...data: any): void {
		this.logWrapper(overrideConsole.log, ...data);
	},

	/**
	 * Wrapper for console.error
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	logError(...data: any): void {
		this.logWrapper(overrideConsole.error, ...data);
	},

	/**
	 * Wrapper for console.warn
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	logWarn(...data: any): void {
		this.logWrapper(overrideConsole.warn, ...data);
	},

	/**
	 * Asks the user to attack a minion or hero
	 *
	 * @returns Cancel | Success
	 */
	async doTurnAttack(): Promise<-1 | boolean | Card> {
		let attacker: Target | -1 | null;
		let target: Target | -1 | null;

		if (game.player.ai) {
			const alternativeModel = `legacyAttack${game.config.ai.attackModel}`;

			// Run the correct ai attack model
			const model = game.player.ai[alternativeModel as keyof Ai];
			const aiSelections = model
				? (model as () => Array<-1 | Target>)()
				: game.player.ai.attack();

			attacker = aiSelections[0];
			target = aiSelections[1];

			if (attacker === -1 || target === -1) {
				return -1;
			}

			if (attacker === null || target === null) {
				return false;
			}
		} else {
			attacker = await game.interact.selectTarget(
				"Which minion do you want to attack with?",
				undefined,
				"friendly",
				"any",
			);

			if (!attacker) {
				return false;
			}

			target = await game.interact.selectTarget(
				"Which minion do you want to attack?",
				undefined,
				"enemy",
				"any",
			);

			if (!target) {
				return false;
			}
		}

		const errorCode = await game.attack(attacker, target);

		const ignore = ["divineshield"];
		if (errorCode === true || ignore.includes(errorCode)) {
			return true;
		}

		let error: string;

		switch (errorCode) {
			case "taunt": {
				error = "There is a minion with taunt in the way";
				break;
			}

			case "stealth": {
				error = "That minion has stealth";
				break;
			}

			case "frozen": {
				error = "That minion is frozen";
				break;
			}

			case "playernoattack": {
				error = "You don't have any attack";
				break;
			}

			case "noattack": {
				error = "That minion has no attack";
				break;
			}

			case "playerhasattacked": {
				error = "Your hero has already attacked this turn";
				break;
			}

			case "hasattacked": {
				error = "That minion has already attacked this turn";
				break;
			}

			case "sleepy": {
				error = "That minion is exhausted";
				break;
			}

			case "cantattackhero": {
				error = "That minion cannot attack heroes";
				break;
			}

			case "immune": {
				error = "That minion is immune";
				break;
			}

			case "dormant": {
				error = "That minion is dormant";
				break;
			}

			case "titan": {
				error = "That minion has titan abilities that hasn't been used";
				break;
			}

			default: {
				error = format(
					"An unknown error occurred. Error code: UnexpectedAttackingResult@%s",
					errorCode,
				);

				break;
			}
		}

		console.log("<red>%s.</red>", logger.translate(error));
		await game.pause("");
		return false;
	},

	/**
	 * Tries to run `cmd` as a command. If it fails, return -1
	 *
	 * @param cmd The command
	 * @param flags Some flags to pass to the commands
	 *
	 * @returns A string if "echo" is false
	 */
	async handleCmds(
		cmd: string,
		flags?: { echo?: boolean; debug?: boolean },
	): Promise<boolean | string | -1> {
		const args = cmd.split(" ");
		const name = args.shift()?.toLowerCase();
		if (!name) {
			await game.pause("<red>Invalid command.</red>\n");
			return false;
		}

		const getReturn = (result: unknown) => {
			if (typeof result === "string" || result === -1) {
				return result as string | -1;
			}

			return true;
		};

		const commandName = Object.keys(commands).find((cmd) =>
			cmd.startsWith(name),
		);

		if (commandName) {
			const command = commands[commandName];
			const result = await command(args, flags);
			return getReturn(result);
		}

		if (!name.startsWith(game.config.advanced.debugCommandPrefix)) {
			return -1;
		}

		const debugName = name.slice(1);

		const debugCommandName = Object.keys(debugCommands).find((cmd) =>
			cmd.startsWith(debugName),
		);

		if (debugCommandName) {
			if (!game.config.general.debug) {
				await game.pause(
					"<red>You are not allowed to use this command.</red>\n",
				);
				return false;
			}

			const command = debugCommands[debugCommandName];
			const result = await command(args, flags);
			return getReturn(result);
		}

		return -1;
	},

	/**
	 * Tries to handle `input` as a command. If it fails, try to play the card with the index of `input`.
	 *
	 * @param input The user input
	 *
	 * @returns The return value of `game.playCard`
	 */
	async doTurnLogic(input: string): Promise<GamePlayCardReturn> {
		if ((await this.handleCmds(input)) !== -1) {
			return true;
		}

		const parsedInput = game.lodash.parseInt(input);

		const card = game.player.hand[parsedInput - 1];
		if (!card) {
			return "invalid";
		}

		if (parsedInput === game.player.hand.length || parsedInput === 1) {
			await card.activate("outcast");
		}

		return game.play(card, game.player);
	},

	/**
	 * Show the game state and asks the user for an input which is put into `doTurnLogic`.
	 *
	 * This is the core of the game loop.
	 *
	 * @returns Success | Ignored error code | The return value of doTurnLogic
	 */
	async doTurn(): Promise<boolean | string | GamePlayCardReturn> {
		await game.event.tick("GameLoop", "doTurn", game.player);

		if (game.player.ai) {
			const rawInput = game.player.ai.calcMove();
			if (!rawInput) {
				return false;
			}

			const input =
				rawInput instanceof Card
					? (game.player.hand.indexOf(rawInput) + 1).toString()
					: rawInput;

			const turn = await this.doTurnLogic(input);

			await game.event.broadcast("Input", input, game.player);
			return turn;
		}

		await game.interact.info.showGame(game.player);
		console.log();

		let input = "Which card do you want to play? ";
		if (game.turn <= 2 && !game.config.general.debug) {
			input +=
				"(type 'help' for further information <- This will disappear once you end your turn) ";
		}

		const user = await game.input(input);
		const returnValue = await this.doTurnLogic(user);

		// If there were no errors, return true.
		if (returnValue === true) {
			return returnValue;
		}

		let error: string;

		// Get the card
		const card = game.player.hand[game.lodash.parseInt(user) - 1];
		let cost = "mana";
		if (card) {
			cost = card.costType;
		}

		// Error Codes
		switch (returnValue) {
			case "cost": {
				error = `Not enough ${cost}`;
				break;
			}

			case "counter": {
				error = "Your card has been countered";
				break;
			}

			case "space": {
				error = `You can only have ${game.config.general.maxBoardSpace} minions on the board`;
				break;
			}

			case "invalid": {
				error = "Invalid card";
				break;
			}

			// Ignore these error codes
			case "refund":
			case "magnetize":
			case "traded":
			case "forged":
			case "colossal": {
				return returnValue;
			}

			default: {
				error = `An unknown error occurred. Error code: UnexpectedDoTurnResult@${returnValue as string}`;
				break;
			}
		}

		await game.pause(`<red>${error}.</red>\n`);

		return false;
	},
};
