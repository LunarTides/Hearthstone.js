import readline from "node:readline/promises";
import { format } from "node:util";
import type {
	GamePlayCardReturn,
	SelectTargetAlignment,
	SelectTargetClass,
	SelectTargetFlag,
	Target,
} from "@Game/types.js";
import { parseTags } from "chalk-tags";
import type { Ai } from "../ai.js";
import { Card } from "../card.js";
import { commands, debugCommands } from "../commands.js";
import type { Player } from "../player.js";

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
	game.functions.interact.log(...data);
};

console.warn = (...data) => {
	game.functions.interact.logWarn(...data);
};

console.error = (...data) => {
	game.functions.interact.logError(...data);
};

export const interactFunctions = {
	// Deck stuff

	/**
	 * Asks the player to supply a deck code.
	 *
	 * If no code was given, fill the players deck with 30 Sheep unless both;
	 * - Debug mode is disabled
	 * - The program is running on the stable branch
	 *
	 * @param player The player to ask
	 *
	 * @returns Success
	 */
	async promptDeckcode(player: Player): Promise<boolean> {
		this.printWatermark();
		console.log();

		const { branch } = game.functions.info.version();

		/**
		 * If the test deck (30 Sheep) should be allowed
		 */
		// I want to be able to test without debug mode on a non-stable branch
		const allowTestDeck: boolean =
			game.config.general.debug || branch !== "stable";

		const debugStatement = allowTestDeck
			? " <gray>(Leave this empty for a test deck)</gray>"
			: "";
		const deckcode = await game.logger.inputTranslate(
			"Player %s, please type in your deckcode%s: ",
			player.id + 1,
			debugStatement,
		);

		let result = true;

		if (deckcode.length > 0) {
			game.logger.debug(`${player.name} chose deck code: ${deckcode}...`);
			result = Boolean(await game.functions.deckcode.import(player, deckcode));

			if (result) {
				game.logger.debug(`${player.name} chose deck code: ${deckcode}...OK`);
			} else {
				game.logger.debug(`${player.name} chose deck code: ${deckcode}...FAIL`);
			}
		} else {
			if (!allowTestDeck) {
				// Give error message
				await game.pause("<red>Please enter a deckcode!</red>\n");
				return false;
			}

			game.logger.debug(`${player.name} chose debug deck...`);

			// Debug mode is enabled, use the 30 Sheep debug deck.
			while (player.deck.length < 30) {
				player.deck.push(await Card.create(game.cardIds.sheep1, player, true));
			}

			game.logger.debug(`${player.name} chose debug deck...OK`);
		}

		return result;
	},

	// One-time things

	/**
	 * Asks the player to choose an option.
	 *
	 * @param times The amount of times to ask
	 * @param prompts [prompt, callback]
	 */
	async promptChooseOne(
		times: number,
		...prompts: Array<[string, () => Promise<void>]>
	): Promise<void> {
		let chosen = 0;

		while (chosen < times) {
			await this.printGameState(game.player);

			if (game.player.ai) {
				const aiChoice = game.player.ai.chooseOne(prompts.map((p) => p[0]));
				if (aiChoice === undefined) {
					continue;
				}

				chosen++;

				// Call the callback function
				await prompts[aiChoice][1]();
				continue;
			}

			let p = `\nChoose ${times - chosen}:\n`;

			for (const [index, promptObject] of prompts.entries()) {
				p += `${index + 1}: ${promptObject[0]},\n`;
			}

			const choice = game.lodash.parseInt(await game.input(p)) - 1;
			if (Number.isNaN(choice) || choice < 0 || choice >= prompts.length) {
				await game.pause("<red>Invalid input!</red>\n");
				this.promptChooseOne(times, ...prompts);
				return;
			}

			chosen++;

			// Call the callback function
			await prompts[choice][1]();
		}
	},

	/**
	 * Asks the `player` a `prompt`, show them a list of `answers` and make them choose one
	 *
	 * @param player The player to ask
	 * @param prompt The prompt to show
	 * @param answers The answers to choose from
	 *
	 * @returns Chosen
	 */
	async promptChooseFromList(
		player: Player,
		prompt: string,
		answers: string[],
	): Promise<string> {
		await this.printGameState(player);

		let strbuilder = `\n${prompt} [`;

		for (const [index, answer] of answers.entries()) {
			strbuilder += `${index + 1}: ${answer}, `;
		}

		strbuilder = strbuilder.slice(0, -2);
		strbuilder += "] ";

		let choice: number;

		if (player.ai) {
			const aiChoice = player.ai.question(prompt, answers);
			if (!aiChoice) {
				// Code, expected, actual
				throw new Error(
					`AI Error: expected: ${aiChoice}, got: some number. Error Code: AiQuestionReturnInvalidAtQuestionFunction`,
				);
			}

			choice = aiChoice;
		} else {
			choice = game.lodash.parseInt(await game.input(strbuilder));
		}

		const answer = answers[choice - 1];
		if (!answer) {
			await game.pause("<red>Invalid input!</red>\n");
			return await this.promptChooseFromList(player, prompt, answers);
		}

		return answer;
	},

	/**
	 * Asks the user a yes/no question
	 *
	 * @param prompt The prompt to ask
	 * @param player Used to check if the player is an ai
	 *
	 * @returns `true` if Yes / `false` if No
	 */
	async promptYN(prompt: string, player?: Player): Promise<boolean> {
		const ask = `\n${prompt} [<bright:green>Y</bright:green> | <red>N</red>] `;

		if (player?.ai) {
			return player.ai.yesNoQuestion(prompt);
		}

		const rawChoice = await game.input(ask);
		const choice = rawChoice.toUpperCase()[0];

		if (["Y", "N"].includes(choice)) {
			return choice === "Y";
		}

		// Invalid input
		console.log(
			"<red>Unexpected input: '<yellow>%s</yellow>'. Valid inputs: </red>[<bright:green>Y</bright:green> | <red>N</red>]",
			rawChoice,
		);

		await game.pause();

		return this.promptYN(prompt, player);
	},

	/**
	 * Like `promptTarget` but restricts the user to selecting heroes.
	 *
	 * The advantage of this function is that it returns `Player | false` instead of `Target | false`.
	 */
	async promptTargetPlayer(
		prompt: string,
		card: Card | undefined,
		flags: SelectTargetFlag[] = [],
	): Promise<Player | null> {
		return (await this.promptTarget(
			prompt,
			card,
			"any",
			"hero",
			flags,
		)) as Player | null;
	},

	/**
	 * Like `promptTarget` but restricts the user to selecting minions.
	 *
	 * The advantage of this function is that it returns `Card | null` instead of `Target | null`.
	 */
	async promptTargetCard(
		prompt: string,
		card: Card | undefined,
		side: SelectTargetAlignment,
		flags: SelectTargetFlag[] = [],
	): Promise<Card | null> {
		return (await this.promptTarget(
			prompt,
			card,
			side,
			"minion",
			flags,
		)) as Card | null;
	},

	/**
	 * #### You might want to use `promptTargetPlayer` or `promptTargetCard` instead.
	 *
	 * Asks the user a `prompt`, the user can then select a minion or hero.
	 * Broadcasts the `TargetSelectionStarts` and the `TargetSelected` event.
	 *
	 * @param prompt The prompt to ask
	 * @param card The card that called this function.
	 * @param forceSide Force the user to only be able to select minions / the hero of a specific side
	 * @param forceClass Force the user to only be able to select a minion or a hero
	 * @param flags Change small behaviours ["allowLocations" => Allow selecting location, ]
	 *
	 * @returns The card or hero chosen
	 */
	async promptTarget(
		prompt: string,
		card: Card | undefined,
		forceSide: SelectTargetAlignment,
		forceClass: SelectTargetClass,
		flags: SelectTargetFlag[] = [],
	): Promise<Target | null> {
		await game.event.broadcast(
			"TargetSelectionStarts",
			[prompt, card, forceSide, forceClass, flags],
			game.player,
		);

		const target = await this._promptTarget(
			prompt,
			card,
			forceSide,
			forceClass,
			flags,
		);

		if (target) {
			await game.event.broadcast("TargetSelected", [card, target], game.player);
		}

		return target;
	},

	/**
	 * # USE `promptTarget` INSTEAD.
	 */
	async _promptTarget(
		prompt: string,
		card: Card | undefined,
		forceSide: SelectTargetAlignment,
		forceClass: SelectTargetClass,
		flags: SelectTargetFlag[] = [],
	): Promise<Target | null> {
		// If the player is forced to select a target, select that target.
		if (game.player.forceTarget) {
			return game.player.forceTarget;
		}

		// Add spell damage in prompt
		const spellDamageRegex = /\$(\d+)/g;
		const matches = spellDamageRegex.exec(prompt);
		matches?.splice(0, 1);

		let newPrompt = prompt;

		if (matches) {
			for (const match of matches) {
				newPrompt = prompt.replace(
					match,
					(game.lodash.parseInt(match) + game.player.spellDamage).toString(),
				);
			}
		}

		newPrompt = prompt.replaceAll(spellDamageRegex, "$1");

		// If the player is an ai, hand over control to the ai.
		if (game.player.ai) {
			return game.player.ai.promptTarget(
				newPrompt,
				card,
				forceSide,
				forceClass,
				flags,
			);
		}

		// If the player is forced to select a hero
		if (forceClass === "hero") {
			// You shouldn't really force a side while forcing a hero, but it should still work
			if (forceSide === "enemy") {
				return game.opponent;
			}

			if (forceSide === "friendly") {
				return game.player;
			}

			const target = await game.input(
				"Do you want to select the enemy hero, or your own hero? (y: enemy, n: friendly) ",
			);

			return target.startsWith("y") ? game.opponent : game.player;
		}

		/*
		 * From this point, forceClass is either
		 * 1. any
		 * 2. minion
		 */

		// Ask the player to choose a target.
		let p = `\n${newPrompt} (`;
		if (forceClass === "any") {
			let possibleHeroes = forceSide === "enemy" ? "the enemy" : "your";
			possibleHeroes = forceSide === "any" ? "a" : possibleHeroes;

			p += `type 'face' to select ${possibleHeroes} hero | `;
		}

		p += "type 'back' to go back) ";

		const target = await game.input(p);

		// Player chose to go back
		if (target.startsWith("b") || this.isInputExit(target)) {
			// This should always be safe.
			return null;
		}

		// If the player chose to target a hero, it will ask which hero.
		if (target.startsWith("face") && forceClass !== "minion") {
			return this._promptTarget(newPrompt, card, forceSide, "hero", flags);
		}

		// From this point, the player has chosen a minion.

		// Get a list of each side of the board
		const boardOpponent = game.opponent.board;
		const boardFriendly = game.player.board;

		// Get each minion that matches the target.
		const boardOpponentTarget = boardOpponent[game.lodash.parseInt(target) - 1];
		const boardFriendlyTarget = boardFriendly[game.lodash.parseInt(target) - 1];

		/**
		 * This is the resulting minion that the player chose, if any.
		 */
		let minion: Card;

		// If the player didn't choose to attack a hero, and no minions could be found at the index requested, try again.
		if (!boardFriendlyTarget && !boardOpponentTarget) {
			await game.pause("<red>Invalid input / minion!</red>\n");

			// Try again
			return this._promptTarget(newPrompt, card, forceSide, forceClass, flags);
		}

		if (forceSide === "any") {
			/*
			 * If both players have a minion with the same index,
			 * ask them which minion to select
			 */
			if (
				boardOpponent.length >= game.lodash.parseInt(target) &&
				boardFriendly.length >= game.lodash.parseInt(target)
			) {
				const opponentTargetName = boardOpponentTarget.colorFromRarity();
				const friendlyTargetName = boardFriendlyTarget.colorFromRarity();

				const alignment = await game.logger.inputTranslate(
					"Do you want to select your opponent's (%s) or your own (%s)? (y: opponent, n: friendly | type 'back' to go back) ",
					opponentTargetName,
					friendlyTargetName,
				);

				if (alignment.startsWith("b") || this.isInputExit(alignment)) {
					// Go back.
					return this._promptTarget(
						newPrompt,
						card,
						forceSide,
						forceClass,
						flags,
					);
				}

				minion = alignment.startsWith("y")
					? boardOpponentTarget
					: boardFriendlyTarget;
			} else {
				// If there is only one minion, select it.
				minion =
					boardOpponent.length >= game.lodash.parseInt(target)
						? boardOpponentTarget
						: boardFriendlyTarget;
			}
		} else {
			/*
			 * If the player is forced to one side.
			 * Select the minion on the correct side of the board.
			 */
			minion =
				forceSide === "enemy" ? boardOpponentTarget : boardFriendlyTarget;
		}

		// If you didn't select a valid minion, return.
		if (minion === undefined) {
			await game.pause("<red>Invalid minion.</red>\n");
			return null;
		}

		// If the minion has elusive, and the card that called this function is a spell
		if (
			(card?.type === "Spell" ||
				card?.type === "Heropower" ||
				flags.includes("forceElusive")) &&
			minion.hasKeyword("Elusive")
		) {
			await game.pause(
				"<red>Can't be targeted by Spells or Hero Powers.</red>\n",
			);
			return null;
		}

		// If the minion has stealth, don't allow the opponent to target it.
		if (minion.hasKeyword("Stealth") && game.player !== minion.owner) {
			await game.pause("<red>This minion has stealth.</red>\n");
			return null;
		}

		// If the minion is a location, don't allow it to be selected unless the `allowLocations` flag was set.
		if (minion.type === "Location" && !flags.includes("allowLocations")) {
			await game.pause("<red>You cannot target location cards.</red>\n");
			return null;
		}

		return minion;
	},

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
	 * Prints the "watermark" border
	 */
	printWatermark(): void {
		game.functions.interact.cls();

		const versionDetail =
			game.player.detailedView || game.config.general.debug ? 4 : 3;

		const watermark = `HEARTHSTONE.JS V${game.functions.info.versionString(versionDetail)}`;
		const border = "-".repeat(watermark.length + 2);

		console.log("|%s|", border);
		console.log("| %s |", watermark);
		console.log("|%s|", border);

		const { branch } = game.functions.info.version();

		if (branch === "topic" && game.config.general.topicBranchWarning) {
			console.log(
				"\n<yellow>WARNING: YOU ARE ON A TOPIC BRANCH. THIS VERSION IS NOT READY.</yellow>",
			);
		}

		if (game.time.events.anniversary) {
			console.log(
				`\n<b>[${game.time.year - 2022} YEAR ANNIVERSARY! Enjoy some fun-facts about Hearthstone.js!]</b>`,
			);
		}
	},

	/**
	 * Prints some license info
	 *
	 * @param disappear If this is true, "This will disappear once you end your turn" will show up.
	 */
	printLicense(disappear = true): void {
		if (game.config.general.debug) {
			return;
		}

		const { branch } = game.functions.info.version();

		this.cls();

		const version = `Hearthstone.js V${game.functions.info.versionString(2)} | Copyright (C) 2022 | LunarTides`;
		console.log("|".repeat(version.length + 8));
		console.log("||| %s |||", version);
		console.log(
			`|||     This program is licensed under the GPL-3.0 license.  ${" ".repeat(branch.length)}|||`,
		);

		if (disappear) {
			console.log(
				`|||         This will disappear once you end your turn.      ${" ".repeat(branch.length)}|||`,
			);
		}

		console.log("|".repeat(version.length + 8));
	},

	/**
	 * Prints all the information you need to understand the game state
	 *
	 * @param player The player
	 */
	async printGameState(player: Player): Promise<void> {
		this.printWatermark();
		console.log();

		if (game.turn <= 2 && !game.config.general.debug) {
			this.printLicense();
			console.log();
		}

		await this.printPlayerStats(player);
		console.log();
		await this.printBoard(player);
		console.log();
		await this.printHand(player);
	},

	/**
	 * Prints the player stats.
	 */
	async printPlayerStats(currentPlayer: Player): Promise<void> {
		let finished = "";

		const doStat = async (callback: (player: Player) => Promise<string>) => {
			const player = await callback(currentPlayer);
			const opponent = await callback(currentPlayer.getOpponent());

			if (!player && !opponent) {
				return;
			}

			if (!player) {
				finished += `${opponent.split(":")[0]}: <italic gray>Nothing</italic gray> | ${opponent}`;
			} else if (opponent) {
				finished += `${player} | ${opponent}`;
			} else {
				finished += `${player} | ${player.split(":")[0]}: <italic gray>Nothing</italic gray>`;
			}

			finished += "\n";
		};

		const wallify = (text: string) => {
			const textSplit = game.lodash.initial(text.split("\n"));

			// Wallify the ':' in the first half
			const firstHalf = textSplit.map((line) => line.split("|")[0]);
			const firstHalfWall = game.functions.util.createWall(firstHalf, ":");

			// Wallify the ':' in the second half
			const secondHalf = textSplit.map((line) => line.split("|")[1]);
			const secondHalfWall = game.functions.util.createWall(secondHalf, ":");

			// Combine the two halves
			const newText = firstHalfWall.map(
				(line, index) => `${line}|${secondHalfWall[index]}`,
			);

			// Wallify the '|' in the final result
			const wall = game.functions.util.createWall(newText, "|");

			return wall.join("\n");
		};

		const colorIf = game.functions.color.if;
		const detail = (noDetail: string, detail: string) =>
			currentPlayer.detailedView ? detail : noDetail;

		// Mana
		await doStat(
			async (player) =>
				`Mana: <cyan>${player.mana}</cyan> / <cyan>${player.emptyMana}</cyan>`,
		);

		// Health
		await doStat(
			async (player) =>
				`Health: <red>${player.health}</red> <gray>[${player.armor}]</gray> / <red>${player.maxHealth}</red>`,
		);

		// Deck Size
		await doStat(
			async (player) =>
				`Deck Size: <yellow>${player.deck.length}</yellow> & <yellow>${player.hand.length}</yellow>`,
		);

		// Hero Power
		await doStat(async (player) => {
			const heroPowerCost = colorIf(
				player.canUseHeroPower(),
				"cyan",
				`{${player.hero.heropower?.cost}}`,
			);

			return `Hero Power: ${heroPowerCost} ${player.hero.name}`;
		});

		// Weapon
		await doStat(async (player) => {
			if (!player.weapon) {
				return "";
			}

			return `Weapon: ${detail(player.weapon.colorFromRarity(), await player.weapon.readable())}`;
		});

		// TODO: Add quests, secrets, etc... #277

		// Attack
		await doStat(async (player) => {
			// If the player doesn't have any attack, don't show the attack.
			if (player.attack <= 0) {
				return "";
			}

			return `Attack: <bright:green>${player.attack}</bright:green>`;
		});

		// Corpses
		await doStat(async (player) => {
			if (player.corpses <= 0 || !player.canUseCorpses()) {
				return "";
			}

			return `Corpses: <gray>${player.corpses}</gray>`;
		});

		console.log(wallify(finished));

		if (game.time.events.anniversary) {
			console.log(
				"<i>[Anniversary: The code for the stats above was rewritten 3 times in total]</i>",
			);
		}
	},

	/**
	 * Prints the board for a specific player.
	 */
	async printBoard(player: Player): Promise<void> {
		for (const plr of [game.player1, game.player2]) {
			const sideMessage =
				plr === player
					? "----- Board (You) ------"
					: "--- Board (Opponent) ---";
			console.log(sideMessage);

			if (plr.board.length === 0) {
				console.log("<gray>Empty</gray>");
				continue;
			}

			for (const [index, card] of plr.board.entries()) {
				console.log(await card.readable(index + 1));
			}
		}

		console.log("------------------------");
	},

	/**
	 * Prints the hand of the specified player.
	 */
	async printHand(player: Player): Promise<void> {
		console.log("--- %s (%s)'s Hand ---", player.name, player.heroClass);

		const debugInfo = game.config.general.debug
			? "(<gray>Debug Info -></gray> #id @uuid <gray>[tags]</gray>) "
			: "";

		// Add the help message
		console.log(
			`([index] <cyan>{Cost}</cyan> <b>Name</b> ${debugInfo}<bright:green>[attack / health]</bright:green> <yellow>(type)</yellow>)\n`,
		);

		for (const [index, card] of player.hand.entries()) {
			console.log(await card.readable(index + 1));
		}
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

		question = game.logger.translate(question);
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
	_logWrapper(callback: (...data: any) => void, ...data: any): void {
		if (game.noOutput) {
			return;
		}

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const newData = data.map((i: any) =>
			typeof i === "string" ? parseTags(game.logger.translate(i)) : i,
		);

		callback(...newData);
	},

	/**
	 * Wrapper for console.log
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	log(...data: any): void {
		this._logWrapper(overrideConsole.log, ...data);
	},

	/**
	 * Wrapper for console.error
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	logError(...data: any): void {
		this._logWrapper(overrideConsole.error, ...data);
	},

	/**
	 * Wrapper for console.warn
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	logWarn(...data: any): void {
		this._logWrapper(overrideConsole.warn, ...data);
	},

	/**
	 * DO NOT CALL THIS FUNCTION.
	 *
	 * Asks the user to attack a minion or hero. Used in the gameloop.
	 *
	 * @returns Cancel | Success
	 */
	async promptGameloopAttack(): Promise<-1 | boolean | Card> {
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
			attacker = await this.promptTarget(
				"Which minion do you want to attack with?",
				undefined,
				"friendly",
				"any",
			);

			if (!attacker) {
				return false;
			}

			target = await this.promptTarget(
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

		console.log("<red>%s.</red>", game.logger.translate(error));
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
	async processCommand(
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
	async _gameloopHandleInput(input: string): Promise<GamePlayCardReturn> {
		if ((await this.processCommand(input)) !== -1) {
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
	 * Show the game state and asks the user for an input which is put into `gameloopLogic`.
	 *
	 * This is the core of the game loop.
	 *
	 * @returns Success | Ignored error code | The return value of doTurnLogic
	 */
	async gameloop(): Promise<boolean | string | GamePlayCardReturn> {
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

			const turn = await this._gameloopHandleInput(input);

			await game.event.broadcast("Input", input, game.player);
			return turn;
		}

		await game.functions.interact.printGameState(game.player);
		console.log();

		let input = "Which card do you want to play? ";
		if (game.turn <= 2 && !game.config.general.debug) {
			input +=
				"(type 'help' for further information <- This will disappear once you end your turn) ";
		}

		const user = await game.input(input);
		const returnValue = await this._gameloopHandleInput(user);

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
