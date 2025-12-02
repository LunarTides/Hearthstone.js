import type { AI } from "@Game/ai.ts";
import { Card } from "@Game/card.ts";
import { commands, debugCommands } from "@Game/commands.ts";
import type { Player } from "@Game/player.ts";
import {
	Ability,
	Alignment,
	Event,
	GameAttackReturn,
	GamePlayCardReturn,
	Keyword,
	type Target,
	type TargetFlags,
	TargetType,
	Type,
	UseLocationError,
} from "@Game/types.ts";
import readline from "node:readline/promises";
import { format } from "node:util";
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
	game.functions.interact.log(...data);
};

console.warn = (...data) => {
	game.functions.interact.logWarn(...data);
};

console.error = (...data) => {
	game.functions.interact.logError(...data);
};

// Exit on ctrl+c
rl.on("SIGINT", () => {
	process.exit();
});

let seenFunFacts: string[] = [];

const prompt = {
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
	async deckcode(player: Player): Promise<boolean> {
		game.functions.interact.print.watermark();
		console.log();

		const { branch } = game.functions.info.version();

		/**
		 * If the test deck (30 Sheep) should be allowed
		 */
		// I want to be able to test without debug mode on a non-stable branch
		const allowTestDeck: boolean =
			game.isDebugSettingEnabled(game.config.debug.allowTestDeck) ||
			branch !== "stable";

		const debugStatement = allowTestDeck
			? " <gray>(Leave this empty for a test deck)</gray>"
			: "";
		const deckcode = await game.inputTranslate(
			"Player %s, please type in your deckcode%s: ",
			player.id + 1,
			debugStatement,
		);

		let result = true;

		if (deckcode.length > 0) {
			game.interest(`${player.getName()} chose deck code: ${deckcode}...`);
			result = Boolean(await game.functions.deckcode.import(player, deckcode));

			if (result) {
				game.interest(`${player.getName()} chose deck code: ${deckcode}...OK`);
			} else {
				game.interest(
					`${player.getName()} chose deck code: ${deckcode}...FAIL`,
				);
			}
		} else {
			if (!allowTestDeck) {
				// Give error message
				await game.pause("<red>Please enter a deckcode!</red>\n");
				return false;
			}

			game.interest(`${player.getName()} chose debug deck...`);

			// Debug mode is enabled, use the 30 Sheep debug deck.
			while (player.deck.length < 30) {
				const sheep = await Card.create(game.cardIds.sheep_1, player, true);
				player.addToDeck(sheep);
			}

			game.interest(`${player.getName()} chose debug deck...OK`);
		}

		return result;
	},

	/**
	 * Asks the player to choose an option.
	 *
	 * @param times The amount of times to ask
	 * @param prompts [prompt, callback]
	 */
	async chooseOne(
		times: number,
		...prompts: Array<[string, () => Promise<void>]>
	): Promise<void> {
		let chosen = 0;

		while (chosen < times) {
			await game.functions.interact.print.gameState(game.player);

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
				this.chooseOne(times, ...prompts);
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
	async chooseFromList(
		player: Player,
		prompt: string,
		answers: string[],
	): Promise<string> {
		await game.functions.interact.print.gameState(player);

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
			return await this.chooseFromList(player, prompt, answers);
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
	async yesNo(prompt: string, player?: Player): Promise<boolean> {
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

		return this.yesNo(prompt, player);
	},

	/**
	 * Like `target` but restricts the user to selecting heroes.
	 *
	 * The advantage of this function is that it returns `Player | false` instead of `Target | false`.
	 */
	async targetPlayer(
		prompt: string,
		card: Card | undefined,
		flags: TargetFlags,
	): Promise<Player | null> {
		return (await this.target(prompt, card, {
			...flags,
			targetType: TargetType.Player,
		})) as Player | null;
	},

	/**
	 * Like `target` but restricts the user to selecting minions.
	 *
	 * The advantage of this function is that it returns `Card | null` instead of `Target | null`.
	 */
	async targetCard(
		prompt: string,
		card: Card | undefined,
		flags: TargetFlags = {},
	): Promise<Card | null> {
		return (await this.target(prompt, card, {
			...flags,
			targetType: TargetType.Card,
		})) as Card | null;
	},

	/**
	 * #### You might want to use `targetPlayer` or `targetCard` instead.
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
	async target(
		prompt: string,
		card: Card | undefined,
		flags: TargetFlags = {},
	): Promise<Target | null> {
		await game.event.broadcast(
			Event.TargetSelectionStarts,
			[prompt, card, flags],
			game.player,
		);

		const target = await this._target(prompt, card, flags);

		if (target) {
			await game.event.broadcast(
				Event.TargetSelected,
				[card, target],
				game.player,
			);
		}

		return target;
	},

	/**
	 * # USE `target` INSTEAD.
	 */
	async _target(
		prompt: string,
		card: Card | undefined,
		flags: TargetFlags = {},
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
			return game.player.ai.promptTarget(newPrompt, card, flags);
		}

		// If the player is forced to select a player
		if (flags.targetType === TargetType.Player) {
			// You shouldn't really force a side while forcing a player, but it should still work
			if (flags.alignment === Alignment.Enemy) {
				return game.opponent;
			}

			if (flags.alignment === Alignment.Friendly) {
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
		 * 2. card
		 */

		// Ask the player to choose a target.
		let p = `\n${newPrompt} (`;
		if (!flags.targetType) {
			let possibleHeroes =
				flags.alignment === Alignment.Enemy ? "the enemy" : "your";
			possibleHeroes = !flags.alignment ? "a" : possibleHeroes;

			p += `type 'face' to select ${possibleHeroes} hero | `;
		}

		p += "type 'back' to go back) ";

		const target = await game.input(p);

		// Player chose to go back
		if (target.startsWith("b") || game.functions.interact.isInputExit(target)) {
			// This should always be safe.
			return null;
		}

		// If the player chose to target a player, it will ask which player.
		if (target.startsWith("face") && flags.targetType !== TargetType.Card) {
			return this._target(newPrompt, card, {
				...flags,
				targetType: TargetType.Player,
			});
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
			return this._target(newPrompt, card, flags);
		}

		if (!flags.alignment) {
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

				const alignment = await game.inputTranslate(
					"Do you want to select your opponent's (%s) or your own (%s)? (y: opponent, n: friendly | type 'back' to go back) ",
					opponentTargetName,
					friendlyTargetName,
				);

				if (
					alignment.startsWith("b") ||
					game.functions.interact.isInputExit(alignment)
				) {
					// Go back.
					return this._target(newPrompt, card, flags);
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
				flags.alignment === Alignment.Enemy
					? boardOpponentTarget
					: boardFriendlyTarget;
		}

		// If you didn't select a valid minion, return.
		if (minion === undefined) {
			await game.pause("<red>Invalid minion.</red>\n");
			return null;
		}

		// If the minion has elusive, and the card that called this function is a spell or heropower.
		if (
			(card?.type === Type.Spell ||
				card?.type === Type.HeroPower ||
				flags.forceElusive) &&
			minion.hasKeyword(Keyword.Elusive)
		) {
			await game.pause(
				"<red>Can't be targeted by Spells or Hero Powers.</red>\n",
			);
			return null;
		}

		// If the minion has stealth, don't allow the opponent to target it.
		if (minion.hasKeyword(Keyword.Stealth) && game.player !== minion.owner) {
			await game.pause("<red>This minion has stealth.</red>\n");
			return null;
		}

		// If the minion is a location, don't allow it to be selected unless the `allowLocations` flag was set.
		if (minion.type === Type.Location && !flags.allowLocations) {
			await game.pause("<red>You cannot target location cards.</red>\n");
			return null;
		}

		return minion;
	},

	/**
	 * Asks the user to select a location card to use, and activate it.
	 *
	 * @returns Success
	 */
	async useLocation(): Promise<UseLocationError> {
		const locations = game.player.board.filter((m) => m.type === Type.Location);
		if (locations.length <= 0) {
			return UseLocationError.NoLocationsFound;
		}

		const location = await this.targetCard(
			"Which location do you want to use?",
			undefined,
			{
				alignment: Alignment.Friendly,
				allowLocations: true,
			},
		);

		if (!location) {
			return UseLocationError.Refund;
		}

		if (location.type !== Type.Location) {
			return UseLocationError.InvalidType;
		}

		if (location.cooldown && location.cooldown > 0) {
			return UseLocationError.Cooldown;
		}

		if ((await location.trigger(Ability.Use)) === Card.REFUND) {
			return UseLocationError.Refund;
		}

		if (location.durability === undefined) {
			throw new Error("Location card's durability is undefined");
		}

		location.durability -= 1;
		location.cooldown = location.backups.init.cooldown;
		return UseLocationError.Success;
	},

	/**
	 * Asks the player to mulligan their cards
	 *
	 * @param player The player to ask
	 *
	 * @returns A string of the indexes of the cards the player mulligan'd
	 */
	async mulligan(player: Player): Promise<string> {
		await game.functions.interact.print.gameState(player);

		let sb = "\nChoose the cards to mulligan (1, 2, 3, ...):\n";
		if (
			!game.isDebugSettingEnabled(game.config.debug.hideRedundantInformation)
		) {
			sb +=
				"<gray>(Example: 13 will mulligan the cards with the ids 1 and 3, 123 will mulligan the cards with the ids 1, 2 and 3, just pressing enter will not mulligan any cards):</gray>\n";
		}

		const input = player.ai ? player.ai.mulligan() : await game.input(sb);
		await player.mulligan(input);

		return input;
	},

	/**
	 * Asks the current player a `prompt` and shows 3 cards from their deck for the player to choose, the chosen card will be added to the top of their deck
	 *
	 * @param prompt The prompt to ask the user
	 *
	 * @returns The card chosen
	 */
	async dredge(prompt = "Choose a card to Dredge:"): Promise<Card | undefined> {
		// Look at the bottom three cards of the deck and put one on the top.
		const cards = game.player.deck.slice(0, 3);

		// Check if ai
		if (game.player.ai) {
			const card = game.player.ai.dredge(cards);
			if (!card) {
				return undefined;
			}

			// Removes the selected card from the players deck.
			game.functions.util.remove(game.player.deck, card);
			game.player.addToDeck(card);

			return card;
		}

		await game.functions.interact.print.gameState(game.player);

		console.log("\n%s", prompt);

		if (cards.length <= 0) {
			return undefined;
		}

		for (const [index, card] of cards.entries()) {
			console.log(await card.readable(index + 1));
		}

		const choice = await game.input("> ");

		const cardId = game.lodash.parseInt(choice) - 1;
		const card = cards[cardId];

		if (!card) {
			return this.dredge(prompt);
		}

		// Removes the selected card from the players deck.
		game.functions.util.remove(game.player.deck, card);
		game.player.addToDeck(card);

		return card;
	},

	/**
	 * Asks the user a "prompt", show them "amount" cards. The cards are chosen from "cards".
	 *
	 * @param prompt The prompt to ask
	 * @param cards The cards to choose from
	 * @param filterClassCards If it should filter away cards that do not belong to the player's class. Keep this at default if you are using `functions.card.getAll()`, disable this if you are using either player's deck / hand / graveyard / etc...
	 * @param amount The amount of cards to show
	 * @param _static_cards Do not use this variable, keep it at default
	 *
	 * @returns The card chosen.
	 */
	async discover(
		prompt: string,
		cards: Card[] = [],
		filterClassCards = true,
		amount = 3,
		_static_cards: Card[] = [],
	): Promise<Card | undefined> {
		let actualCards = cards;

		await game.functions.interact.print.gameState(game.player);
		let values: Card[] = _static_cards;

		if (actualCards.length <= 0) {
			actualCards = await Card.all();
		}

		if (actualCards.length <= 0 || !actualCards) {
			return undefined;
		}

		if (filterClassCards) {
			/*
			 * We need to filter the cards
			 * of the filter function
			 */
			actualCards = actualCards.filter((card) =>
				game.functions.card.validateClasses(
					card.classes,
					game.player.heroClass,
				),
			);
		}

		// No cards from previous discover loop, we need to generate new ones.
		if (_static_cards.length === 0) {
			values = game.lodash.sampleSize(actualCards, amount);
			values = values.map((c) => {
				if (c instanceof Card) {
					c.perfectCopy();
				}

				return c;
			});
		}

		if (values.length <= 0) {
			return undefined;
		}

		if (game.player.ai) {
			return game.player.ai.discover(values);
		}

		console.log("\n%s:", prompt);

		for (const [index, card] of values.entries()) {
			console.log(await card.readable(index + 1));
		}

		const choice = await game.input();

		if (!values[game.lodash.parseInt(choice) - 1]) {
			/*
			 * Invalid input
			 * We still want the user to be able to select a card, so we force it to be valid
			 */
			return this.discover(
				prompt,
				actualCards,
				filterClassCards,
				amount,
				values,
			);
		}

		const card = values[game.lodash.parseInt(choice) - 1];

		return card;
	},

	/**
	 * DO NOT CALL THIS FUNCTION.
	 *
	 * Asks the user to attack a minion or hero. Used in the gameloop.
	 *
	 * @returns Cancel | Success
	 */
	async gameloopAttack(): Promise<-1 | boolean | Card> {
		let attacker: Target | -1 | null;
		let target: Target | -1 | null;

		if (game.player.ai) {
			const alternativeModel = `legacyAttack${game.config.ai.attackModel}`;

			// Run the correct ai attack model
			const model = game.player.ai[alternativeModel as keyof AI];
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
			attacker = await this.target(
				"Which minion do you want to attack with?",
				undefined,
				{ alignment: Alignment.Friendly },
			);

			if (!attacker) {
				return false;
			}

			target = await this.target(
				"Which minion do you want to attack?",
				undefined,
				{ alignment: Alignment.Enemy },
			);

			if (!target) {
				return false;
			}
		}

		const errorCode = await game.attack(attacker, target);

		const ignore = [GameAttackReturn.DivineShield];
		if (errorCode === GameAttackReturn.Success || ignore.includes(errorCode)) {
			return true;
		}

		let error: string;

		switch (errorCode) {
			case GameAttackReturn.Taunt: {
				error = "There is a minion with taunt in the way";
				break;
			}

			case GameAttackReturn.Stealth: {
				error = "That minion has stealth";
				break;
			}

			case GameAttackReturn.Frozen: {
				error = "That minion is frozen";
				break;
			}

			case GameAttackReturn.PlayerNoAttack: {
				error = "You don't have any attack";
				break;
			}

			case GameAttackReturn.CardNoAttack: {
				error = "That minion has no attack";
				break;
			}

			case GameAttackReturn.PlayerHasAttacked: {
				error = "Your hero has already attacked this turn";
				break;
			}

			case GameAttackReturn.CardHasAttacked: {
				error = "That minion has already attacked this turn";
				break;
			}

			case GameAttackReturn.Exhausted: {
				error = "That minion is exhausted";
				break;
			}

			case GameAttackReturn.CantAttackHero: {
				error = "That minion cannot attack heroes";
				break;
			}

			case GameAttackReturn.Immune: {
				error = "That minion is immune";
				break;
			}

			case GameAttackReturn.Dormant: {
				error = "That minion is dormant";
				break;
			}

			case GameAttackReturn.Titan: {
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

		console.log("<red>%s.</red>", game.translate(error));
		await game.pause("");
		return false;
	},
};

const print = {
	/**
	 * Prints the "watermark" border.
	 */
	watermark() {
		game.functions.interact.cls();

		const versionDetail =
			game.player.detailedView ||
			game.isDebugSettingEnabled(game.config.debug.showCommitHash)
				? 4
				: 3;

		const eventEmojis = game.functions.util.getCurrentEventEmojis();
		let eventEmojisText = eventEmojis.join("");
		if (eventEmojis.length > 0) {
			eventEmojisText += " ";
		}

		const watermark = `HEARTHSTONE.JS ${eventEmojisText}V${game.functions.info.versionString(versionDetail)}`;
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

		if (game.isEventActive(game.time.events.anniversary)) {
			console.log(
				`\n<b>[${game.time.year - 2022} YEAR ANNIVERSARY! Enjoy some fun-facts about Hearthstone.js!]</b>`,
			);
		}

		// Fun facts.
		if (!game.config.general.disableFunFacts) {
			// Cycle through the fun facts. If it has been seen, don't show it again.
			// Once all the fun facts have been shown, cycle through them again.
			let funFacts = game.config.funFacts.filter(
				(funFact) => !seenFunFacts.includes(funFact),
			);

			// If all the fun facts have been shown, show them again.
			if (funFacts.length === 0 && seenFunFacts.length > 0) {
				// If the fun fact ends with a dash, keep it in the list.
				// This is so that the fun facts that are cut off only appear once.
				seenFunFacts = seenFunFacts.filter((funFact: string) =>
					funFact.endsWith("-"),
				);

				funFacts = game.config.funFacts.filter(
					(funFact) => !seenFunFacts.includes(funFact),
				);
			}

			const funFact = game.lodash.sample(funFacts);
			if (funFact) {
				seenFunFacts.push(funFact);

				console.log(
					game.translate("<gray>(Fun Fact: %s)</gray>"),
					game.translate(funFact),
				);
			}
		}
	},

	/**
	 * Prints some license info
	 *
	 * @param disappear If this is true, "This will disappear once you end your turn" will show up.
	 */
	license(disappear = true) {
		if (game.isDebugSettingEnabled(game.config.debug.hideLicense)) {
			return;
		}

		const { branch } = game.functions.info.version();

		game.functions.interact.cls();

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
	async gameState(player: Player): Promise<void> {
		this.watermark();
		console.log();

		if (
			game.turn <= 2 &&
			!game.isDebugSettingEnabled(game.config.debug.hideLicense)
		) {
			this.license();
			console.log();
		}

		await this.playerStats(player);
		console.log();
		await this.board(player);
		console.log();
		await this.hand(player);
	},

	/**
	 * Prints the player stats.
	 */
	async playerStats(currentPlayer: Player): Promise<void> {
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

		const align = (text: string) => {
			const textSplit = game.lodash.initial(text.split("\n"));

			// Align the ':' in the first half
			const firstHalf = textSplit.map((line) => line.split("|")[0]);
			const firstHalfAligned = game.functions.util.alignColumns(firstHalf, ":");

			// Align the ':' in the second half
			const secondHalf = textSplit.map((line) => line.split("|")[1]);
			const secondHalfAligned = game.functions.util.alignColumns(
				secondHalf,
				":",
			);

			// Combine the two halves
			const newText = firstHalfAligned.map(
				(line, index) => `${line}|${secondHalfAligned[index]}`,
			);

			// Align the '|' in the final result
			const aligned = game.functions.util.alignColumns(newText, "|");
			return aligned.join("\n");
		};

		const colorIf = game.functions.color.if;
		const detail = (noDetail: string, detail: string) =>
			currentPlayer.detailedView ? detail : noDetail;
		const detailCard = async (card: Card) =>
			detail(card.colorFromRarity(), await card.readable());

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

			return `Hero Power: ${heroPowerCost} ${detail(
				player.hero.name,
				(await player.hero.heropower?.readable())
					// Remove the mana cost from the readable version.
					// This gives the illusion that the code was well written :)
					?.replace(/\{.*?\} /, "") ?? "No hero power.",
			)}`;
		});

		// Weapon
		await doStat(async (player) => {
			if (!player.weapon) {
				return "";
			}

			return `Weapon: ${await detailCard(player.weapon)}`;
		});

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

		// Quests
		await doStat(async (player) => {
			if (player.quests.length <= 0) {
				return "";
			}

			return `Quests: ${(
				await Promise.all(
					player.quests.map(
						async (q) =>
							`${await detailCard(q.card)} @ [${q.progress.join("/")}] (${q.type})`,
					),
				)
			).join(", ")}`;
		});

		// --- Finished ---
		console.log(align(finished));

		if (game.isEventActive(game.time.events.anniversary)) {
			console.log(
				"<i>[Anniversary: The code for the stats above was rewritten 3 times in total]</i>",
			);
		}
	},

	/**
	 * Prints the board for a specific player.
	 */
	async board(player: Player): Promise<void> {
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
	async hand(player: Player): Promise<void> {
		console.log("--- %s (%s)'s Hand ---", player.getName(), player.heroClass);

		const debugInfo = game.isDebugSettingEnabled(
			game.config.debug.additionalInfoInReadable,
		)
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
};

export const interactFunctions = {
	/**
	 * Prompt related functions.
	 */
	prompt,

	/**
	 * Print related functions.
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
		q = "",
		overrideNoInput = false,
		useInputQueue = true,
	): Promise<string> {
		let question = q;

		const wrapper = async (a: string) => {
			await game.event.broadcast(Event.Input, a, game.player);
			return a;
		};

		if (game.noOutput) {
			question = "";
		}

		if (game.noInput && !overrideNoInput) {
			return wrapper("");
		}

		question = game.translate(question);
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
		this._logWrapper(overrideConsole.log, ...data);
	},

	/**
	 * Wrapper for console.error
	 */
	logError(...data: any): void {
		this._logWrapper(overrideConsole.error, ...data);
	},

	/**
	 * Wrapper for console.warn
	 */
	logWarn(...data: any): void {
		this._logWrapper(overrideConsole.warn, ...data);
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

		if (!name.startsWith(game.config.advanced.debugCommandPrefix)) {
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
	 * @returns The return value of `game.playCard`
	 */
	async _gameloopHandleInput(input: string): Promise<GamePlayCardReturn> {
		if ((await this.processCommand(input)) !== -1) {
			return GamePlayCardReturn.Success;
		}

		const parsedInput = game.lodash.parseInt(input);

		const card = game.player.hand[parsedInput - 1];
		if (!card) {
			return GamePlayCardReturn.Invalid;
		}

		if (parsedInput === game.player.hand.length || parsedInput === 1) {
			await card.trigger(Ability.Outcast);
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
		await game.event.tick(Event.GameLoop, game.turn, game.player);

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

			await game.event.broadcast(Event.Input, input, game.player);
			return turn;
		}

		await game.functions.interact.print.gameState(game.player);
		console.log();

		let input = "Which card do you want to play? ";
		if (
			game.turn <= 2 &&
			!game.isDebugSettingEnabled(game.config.debug.hideRedundantInformation)
		) {
			input +=
				"(type 'help' for further information <- This will disappear once you end your turn) ";
		}

		const user = await game.input(input);
		const returnValue = await this._gameloopHandleInput(user);

		// If there were no errors, return true.
		if (returnValue === GamePlayCardReturn.Success) {
			return returnValue;
		}

		let error: string;

		// Get the card
		const card = game.player.hand[game.lodash.parseInt(user) - 1];
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

		await game.pause(`<red>${error}.</red>\n`);

		return false;
	},
};
