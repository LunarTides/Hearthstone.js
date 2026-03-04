import { Card } from "@Game/card.ts";
import {
	commands,
	debugCommands,
	helpColumns,
	helpDebugColumns,
} from "@Game/commands.ts";
import { Ability, Event, GamePlayCardReturn } from "@Game/types.ts";
import { Separator } from "@inquirer/core";
import { parseTags } from "chalk-tags";
import { print } from "./print.ts";
import { prompt } from "./prompt.ts";
import readInput, { type InputConfig } from "./prompts/input.ts";

export const rawConsole = {
	log: console.log.bind(console),
	warn: console.warn.bind(console),
	error: console.error.bind(console),
};

console.log = (...data) => {
	interact.log(...data);
};

console.warn = (...data) => {
	interact.logWarn(...data);
};

console.error = (...data) => {
	interact.logError(...data);
};

// Exit on ctrl+c
process.on("uncaughtException", (error) => {
	if (error instanceof Error && error.name === "ExitPromptError") {
	} else {
		rawConsole.error(error.stack);
		throw error;
	}
});

export const interact = {
	/**
	 * Prompt related
	 */
	prompt,

	/**
	 * Print related
	 */
	print,

	/**
	 * Returns if the input is a command to exit / go back.
	 */
	isInputExit(input: string): boolean {
		return ["exit", "stop", "quit", "back", "close"].includes(
			input.toLowerCase(),
		);
	},

	/**
	 * Clears the screen.
	 */
	cls(): void {
		if (game?.noOutput) {
			return;
		}

		console.clear();
		process.stdout.write("\u001Bc");
	},

	/**
	 * Shows `status...`, calls `callback`, then adds 'OK' or 'FAIL' to the end of that line depending on the result the callback
	 *
	 * @param status The status to show.
	 * @param callback The callback to call.
	 *
	 * @returns The return value of the callback.
	 */
	async withStatus(
		status: string,
		callback: () => Promise<boolean>,
	): Promise<boolean> {
		process.stdout.write(`${status}...`);
		const success = await callback();

		const message = success ? "OK" : "FAIL";
		process.stdout.write(`\r\u001B[K${status}...${message}\n`);

		return success;
	},

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
		options: InputConfig & {
			overrideNoInput?: boolean;
			ignoreInputQueue?: boolean;
		},
	): Promise<string> {
		const wrapper = async (text: string) => {
			await game.event.broadcast(Event.Input, text, game.player);
			return text;
		};

		if (game.noOutput) {
			options.message = "";
		}

		if (game.noInput && options.overrideNoInput !== true) {
			return wrapper("");
		}

		options.message = game.translate(options.message);
		options.message = parseTags(options.message);

		// Let the game make choices for the user
		if (options.ignoreInputQueue !== true) {
			const queue = game.player.inputQueueNext();
			if (queue !== undefined) {
				return wrapper(queue);
			}
		}

		return wrapper((await readInput(options)) as string);
	},

	/**
	 * Helper function for the `console.log`  Don't use.
	 */
	_logWrapper(callback: (...data: any) => void, ...data: any): void {
		if (game.noOutput) {
			return;
		}

		const newData = data.map((i: any) =>
			typeof i === "string" ? parseTags(game.translate(i)) : i,
		);

		callback(...newData);
	},

	/**
	 * Wrapper for console.log
	 */
	log(...data: any): void {
		this._logWrapper(rawConsole.log, ...data);
	},

	/**
	 * Wrapper for console.error
	 */
	logError(...data: any): void {
		this._logWrapper(rawConsole.error, ...data);
	},

	/**
	 * Wrapper for console.warn
	 */
	logWarn(...data: any): void {
		this._logWrapper(rawConsole.warn, ...data);
	},

	/**
	 * Tries to run `cmd` as a command. If it fails, return -1
	 *
	 * @param cmd The command
	 * @param flags Some flags to pass to the commands
	 *
	 * @returns A string if "echo" is false
	 */
	async processCommand(
		cmd: string,
		flags?: { echo?: boolean; debug?: boolean },
	): Promise<boolean | string | -1> {
		const args = cmd.split(" ");
		const name = args.shift()?.toLowerCase();
		if (!name) {
			console.log("<red>Invalid command.</red>");
			await game.pause("");
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

		if (!name.startsWith(game.config.debug.commandPrefix)) {
			return -1;
		}

		const debugName = name.slice(1);

		const debugCommandName = Object.keys(debugCommands).find((cmd) =>
			cmd.startsWith(debugName),
		);

		if (debugCommandName) {
			if (!game.isDebugSettingEnabled(game.config.debug.commands)) {
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
	 * @returns The return value of `game.play`
	 */
	async _gameloopHandleInput(input: string): Promise<GamePlayCardReturn> {
		if ((await this.processCommand(input)) !== -1) {
			return GamePlayCardReturn.Success;
		}

		const parsedInput = parseInt(input, 10);

		const card = game.player.hand[parsedInput];
		if (!card) {
			return GamePlayCardReturn.Invalid;
		}

		// FIXME: The outcast ability isn't triggered when calling `game.play` manually.
		if (parsedInput === game.player.hand.length || parsedInput === 1) {
			await card.trigger(Ability.Outcast);
		}

		const result = await game.play(card, game.player);
		if (result === GamePlayCardReturn.Success) {
			game.audio.playSFX("game.playCard", { info: { card } });
		}

		return result;
	},

	/**
	 * Show the game state and asks the user for an input which is put into {@link game.interact._gameloopHandleInput}.
	 *
	 * This is the core of the game loop.
	 *
	 * @returns Success | Ignored error code | The return value of doTurnLogic
	 */
	async gameloop(): Promise<boolean | string | GamePlayCardReturn> {
		await game.event.tick(Event.Dummy, undefined, game.player);

		if (game.player.ai) {
			console.log("The AI is thinking...");
			const rawInput = await game.player.ai.gameloop();
			if (!rawInput) {
				return false;
			}

			// TODO: Remove.
			// console.log("\n<b>Best Move</b>:");
			// console.log(rawInput);
			// await game.pause();

			const input =
				rawInput instanceof Card
					? (game.player.hand.indexOf(rawInput) + 1).toString()
					: rawInput;

			const turn = await this._gameloopHandleInput(input);

			await game.event.broadcast(Event.Input, input, game.player);
			return turn;
		}

		let user: string = "";

		const oldInterface = async () => {
			await game.interact.print.gameState(game.player);
			console.log("");

			user = await game.input({ message: "Which card do you want to play? " });

			if (!Number.isNaN(parseInt(user, 10))) {
				user = (parseInt(user, 10) - 1).toString();
			}
		};

		if (game.config.advanced.gameloopUseOldUserInterface) {
			await oldInterface();
		} else {
			const cards = await game.card.readables(game.player.hand);
			await game.prompt.createUILoop(
				{
					message: "Which card do you want to play?",
					backButtonText: "",
					callbackBefore: async () => {
						await game.interact.print.gameState(game.player, false);
					},
				},
				...cards.map((readable) => ({
					name: readable,
					defaultSound: false,
					callback: async (answer: number) => {
						user = answer.toString();
						return false;
					},
				})),
				cards.length > 0 && new Separator(),
				{
					name: "Commands",
					callback: async () => {
						const debugCommandsDisabled = !game.isDebugSettingEnabled(
							game.config.debug.commands,
						);

						// TODO: Disable hero power if the player can't use their hero power. Do this to use, titan.
						const cmds = game.util.alignColumns(
							helpColumns
								.filter((c) => !c.startsWith("(name)"))
								.map((c) => c[0].toUpperCase() + c.slice(1)),
							"-",
						);
						const debugCmds = game.util.alignColumns(
							helpDebugColumns
								.filter((c) => !c.startsWith("(name)"))
								.map((c) => c[0].toUpperCase() + c.slice(1)),
							"-",
						);

						await game.prompt.createUILoop(
							{
								message: "Which command do you want to run?",
							},
							...cmds.map((c) => ({
								name: c,
								callback: async (answer: number) => {
									user = cmds[answer].toLowerCase();
									return false;
								},
							})),
							new Separator(),
							...debugCmds.map((c) => ({
								name: c,
								disabled: debugCommandsDisabled,
								callback: async (answer: number) => {
									// Account for the other choices.
									answer -= cmds.length + 1;

									const command = debugCmds[answer].split(" ")[0].toLowerCase();
									user = game.config.debug.commandPrefix + command;

									// Handle commands with arguments.
									// TODO: Use `search` for give.
									if (["give", "eval"].includes(command)) {
										await game.interact.print.gameState(game.player);
										console.log();

										const args = await game.input({
											message: user,
										});

										user += ` ${args}`;
										return false;
									}

									return false;
								},
							})),
						);

						// If the user hasn't chosen anything, keep going.
						if (!user) {
							return true;
						}

						return false;
					},
				},
				{
					name: "Type in",
					description:
						"Type in the command instead of using the interface. (Old behavior)",
					callback: async () => {
						await oldInterface();
						return false;
					},
				},
			);
		}

		const returnValue = await this._gameloopHandleInput(user);

		// If there were no errors, return true.
		if (returnValue === GamePlayCardReturn.Success) {
			return returnValue;
		}

		let error: string;

		// Get the card
		const card = game.player.hand[parseInt(user, 10)];
		const cost = card ? card.costType : "mana";

		// Error Codes
		switch (returnValue) {
			case GamePlayCardReturn.Cost: {
				error = `Not enough ${cost}`;
				break;
			}

			case GamePlayCardReturn.Counter: {
				error = "Your card has been countered";
				break;
			}

			case GamePlayCardReturn.Space: {
				error = `You can only have ${game.config.general.maxBoardSpace} minions on the board`;
				break;
			}

			case GamePlayCardReturn.Invalid: {
				error = "Invalid card";
				break;
			}

			// Ignore these error codes
			case GamePlayCardReturn.Refund:
			case GamePlayCardReturn.Magnetize:
			case GamePlayCardReturn.Traded:
			case GamePlayCardReturn.Forged:
			case GamePlayCardReturn.Colossal: {
				return returnValue;
			}

			default: {
				error = `An unknown error occurred. Error code: UnexpectedDoTurnResult@${returnValue as string}`;
				break;
			}
		}

		game.audio.playSFX("error");
		await game.pause(`<red>${error}.</red>\n`);

		return false;
	},
};
