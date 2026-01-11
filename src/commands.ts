import { Card } from "@Game/card.ts";
import { Player } from "@Game/player.ts";
import {
	Ability,
	Alignment,
	type CommandList,
	Event,
	Keyword,
	Type,
	UseLocationError,
} from "@Game/types.ts";
import { resumeTagParsing, stopTagParsing } from "chalk-tags";

/*
 * This is the list of commands that can be used in the game.
 * This will be shown when using the "help" command.
 */
export const helpColumns = [
	"(name) - (description)\n",

	"attack - Attack a target.",
	"end - End your turn.",
	"hero power - Use your hero power.",
	"history - Show a list of things that have happened this game.",
	"use - Use a location card.",
	"titan - Use a titan card.",
	"concede - Forfeit the game.",
	"detail - Toggle showing more details about the game.",
	"version - Show information about the version, branch, and settings of the game.",
	"help - Show information about the different commands.",
	"license - Open a link to this project's license.",
];

/*
 * This is the list of debug commands that can be used in the game.
 * This will also be shown when using the "help" command.
 */
export const helpDebugColumns = [
	"(name) (required) [optional] - (description)\n",

	"give (name | id) - Add a card to your hand.",
	"eval [log] (code) - Run some code. Be careful with copying code from the internet since it could be malicious.",
	"exit - Force exit the game. There will be no winner, and it will take you straight back to the hub.",
	"history - Show a list of things that have happened this game. Unlike the normal history command, this doesn't hide any information, and is the same thing the log files uses.",
	"rl - Reload the cards, config, and translation files.",
	"frl - Reload the cards, config, and translation files. Don't wait for user input before continuing.",
	"undo - Undo the last card played. It gives the card back to your hand, and removes it from where it was. (This does not undo the actions of the card)",
	"ai - Show a list of the actions the ai(s) have taken this game.",
];

export const commands: CommandList = {
	async end(): Promise<boolean> {
		await game.endTurn();
		return true;
	},

	async "hero power"(): Promise<boolean> {
		if (game.player.ai) {
			await game.player.heroPower();
			return true;
		}

		if (game.player.mana < game.player.hero.heropower!.cost) {
			await game.pause("<red>You do not have enough mana.</red>\n");
			return false;
		}

		if (game.player.hasUsedHeroPowerThisTurn) {
			await game.pause(
				"<red>You have already used your hero power this turn.</red>\n",
			);

			return false;
		}

		if (game.player.heroPowerBlockers.length > 0) {
			await game.pause("<red>Your hero power is currently disabled.</red>\n");
			return false;
		}

		await game.functions.interact.print.gameState(game.player);
		const ask = await game.prompt.yesNo(
			`<yellow>${game.player.hero.heropower?.text}</yellow> Are you sure you want to use this hero power?`,
			game.player,
		);

		if (!ask) {
			return false;
		}

		await game.functions.interact.print.gameState(game.player);
		await game.player.heroPower();
		return true;
	},

	async attack(): Promise<boolean> {
		await game.prompt.gameloopAttack();
		return true;
	},

	async use(): Promise<boolean> {
		// Use location
		const errorCode = await game.prompt.useLocation();
		if (
			errorCode === UseLocationError.Success ||
			errorCode === UseLocationError.Refund ||
			game.player.ai
		) {
			return true;
		}

		let error: string;

		switch (errorCode) {
			case UseLocationError.NoLocationsFound: {
				error = "You have no location cards";
				break;
			}

			case UseLocationError.InvalidType: {
				error = "That card is not a location card";
				break;
			}

			case UseLocationError.Cooldown: {
				error = "That location is on cooldown";
				break;
			}

			default: {
				error = `An unknown error occourred. Error code: UnexpectedUseLocationResult@${errorCode}`;
				break;
			}
		}

		console.log("<red>%s.</red>", error);
		await game.pause();
		return true;
	},

	async titan(): Promise<boolean> {
		// Use titan card
		const card = await game.prompt.targetCard(
			"Which card do you want to use?",
			undefined,
			{ alignment: Alignment.Friendly },
			async (target) =>
				!target.hasKeyword(Keyword.Titan) || target.attackTimes <= 0,
		);

		if (!card) {
			return false;
		}

		const titanIds = card.getKeyword(Keyword.Titan) as string[] | undefined;
		if (!titanIds) {
			return false;
		}

		const titanCards = await Promise.all(
			titanIds.map(async (id) => Card.create(id, game.player, true)),
		);

		const choice = await game.prompt.customSelect(
			"Which ability do you want to trigger?",
			await game.functions.card.readables(titanCards),
		);
		if (choice === "Back") {
			return false;
		}

		const abilityIndex = parseInt(choice, 10);
		const ability = titanCards[abilityIndex];

		if ((await ability.trigger(Ability.Cast)) === Card.REFUND) {
			await game.event.withSuppressed(Event.DiscardCard, async () =>
				ability.discard(),
			);

			return false;
		}

		titanIds.splice(abilityIndex, 1);
		card.setKeyword(Keyword.Titan, titanIds);

		if (titanIds.length <= 0) {
			card.removeKeyword(Keyword.Titan);
		} else {
			card.exhaust();
		}

		await game.event.broadcast(Event.Titan, [card, ability], game.player);
		return true;
	},

	async help(): Promise<boolean> {
		game.functions.interact.print.watermark();

		console.log(
			"\n(In order to run a command; input the name of the command and follow further instruction.)\n",
		);

		console.log("Available commands:");

		const columns = helpColumns.map((column) => game.translate(column));
		const alignedColumns = game.functions.util.alignColumns(columns, "-");

		const debugColumns = helpDebugColumns.map((column) =>
			game.translate(column),
		);
		const debugAlignedColumns = game.functions.util.alignColumns(
			debugColumns,
			"-",
		);

		// Normal commands
		for (const alignedColumn of alignedColumns) {
			console.log(alignedColumn);
		}

		const isDebugCommandsEnabled = game.isDebugSettingEnabled(
			game.config.debug.commands,
		);

		const condColor = (text: string) =>
			// We can't use `game.functions.color.if` here since the text should be uncolored if the condition is met.
			isDebugCommandsEnabled ? text : `<gray>${text}</gray>`;

		const debugEnabledText = isDebugCommandsEnabled
			? "<bright:green>ON</bright:green>"
			: "<red>OFF</red>";

		console.log(condColor(`\n--- Debug Commands (${debugEnabledText}) ---`));

		// Debug Commands
		for (const alignedColumn of debugAlignedColumns) {
			console.log(
				condColor(game.config.advanced.debugCommandPrefix + alignedColumn),
			);
		}

		console.log(
			condColor(
				`---------------------------${isDebugCommandsEnabled ? "" : "-"}`,
			),
		);

		console.log();
		await game.pause("Press enter to continue...\n");
		return true;
	},

	async detail(): Promise<boolean> {
		game.player.detailedView = !game.player.detailedView;
		return true;
	},

	async concede(): Promise<boolean> {
		await game.functions.interact.print.gameState(game.player);

		const confirmation = await game.prompt.yesNo(
			"Are you sure you want to concede?",
			game.player,
		);

		if (confirmation) {
			await game.endGame(game.player.getOpponent());
		}

		return confirmation;
	},

	async license(): Promise<boolean> {
		game.functions.util.openInBrowser(
			`${game.config.info.githubUrl}/blob/main/LICENSE`,
		);

		return true;
	},

	async version(): Promise<boolean> {
		const { version, branch, build } = game.functions.info.version();

		await game.functions.interact.print.gameState(game.player);

		let strbuilder = `\nYou are on version: <yellow>${version}</yellow>, on `;

		switch (branch) {
			case "topic": {
				strbuilder += "a <yellow>topic</yellow> branch";
				break;
			}

			case "alpha": {
				strbuilder += "the <yellow>alpha</yellow> branch";
				break;
			}

			case "beta": {
				strbuilder += "the <yellow>beta</yellow> branch";
				break;
			}

			case "stable": {
				strbuilder += "the <yellow>stable (release)</yellow> branch";
				break;
			}

			default: {
				strbuilder += "an unknown branch";
				break;
			}
		}

		strbuilder += `, on build <yellow>${build}</yellow>`;
		strbuilder += `, with latest commit hash <yellow>${game.functions.info.latestCommit()}</yellow>.`;

		console.log(`${strbuilder}.\n`);
		console.log("Version Description:");

		let introText: string;

		switch (branch) {
			case "topic": {
				introText = game.config.info.topicIntroText;
				break;
			}

			case "alpha": {
				introText = game.config.info.alphaIntroText;
				break;
			}

			case "beta": {
				introText = game.config.info.betaIntroText;
				break;
			}

			case "stable": {
				introText = game.config.info.stableIntroText;
				break;
			}

			default: {
				introText = "This is an unknown branch.";
				break;
			}
		}

		console.log(introText);
		if (game.config.info.versionText) {
			console.log(game.config.info.versionText);
		}

		const openIssues = await game.prompt.yesNo(
			"Do you want to open the todo list in your browser?",
			game.player,
		);

		if (openIssues) {
			game.functions.util.openInBrowser(`${game.config.info.githubUrl}/issues`);
		}

		return true;
	},

	async history(_, flags): Promise<string> {
		// History
		const history = game.event.history;
		let finished = "";

		const showCard = async (value: Card) =>
			`${await value.readable()} which belongs to: <blue>${value.owner.getName()}</blue>, and has uuid: ${value.coloredUUID()}`;

		/**
		 * Transform the `value` into a readable string
		 *
		 * @param hide If it should hide the card
		 */
		const doValue = async (
			value: unknown,
			player: Player,
			hide: boolean,
		): Promise<unknown> => {
			if (value instanceof Player) {
				return `Player ${value.id + 1}`;
			}

			if (!(value instanceof Card)) {
				// Stringify it to show '{}' instead of '[object Object]'.
				return JSON.stringify(value);
			}

			// If the card is not hidden, or the card belongs to the current player, show it
			if (!hide || value.owner === player) {
				return await showCard(value);
			}

			// Hide the card
			let revealed = false;

			// It has has been revealed, show it.
			for (const historyValue of Object.values(history)) {
				if (revealed) {
					break;
				}

				for (const historyKey of historyValue) {
					if (revealed) {
						break;
					}

					const [key, newValue] = historyKey;
					if (!newValue) {
						continue;
					}

					if (game.config.advanced.whitelistedHistoryKeys.includes(key)) {
						// Do nothing
					} else {
						continue;
					}

					if (game.config.advanced.hideValueHistoryKeys.includes(key)) {
						continue;
					}

					// If it is not a card
					if (!(newValue instanceof Card)) {
						continue;
					}

					if (value.uuid !== newValue.uuid) {
						continue;
					}

					// The card has been revealed.
					revealed = true;
				}
			}

			if (revealed) {
				return `Hidden > Revealed as: ${await showCard(value)}`;
			}

			return "Hidden";
		};

		for (const [historyListIndex, historyList] of Object.values(
			history,
		).entries()) {
			// Ignore everything that happens on turn 0.
			if (historyListIndex <= 0 && !flags?.debug) {
				continue;
			}

			let hasPrintedHeader = false;
			let previousPlayer: Player | undefined;

			for (const [historyIndex, historyKey] of historyList.entries()) {
				const [key, value, player] = historyKey;
				if (!player) {
					continue;
				}

				// Ignore everything the second player does on turn 1.
				// The turn counter goes up at the end of every player's turn,
				// so it should be impossible for the second player to do things on turn 1.
				if (historyListIndex === 1 && player.id === 1 && !flags?.debug) {
					continue;
				}

				if (player !== previousPlayer) {
					hasPrintedHeader = false;
				}

				previousPlayer = player;

				if (
					game.config.advanced.whitelistedHistoryKeys.includes(key) ||
					flags?.debug
				) {
					// Pass
				} else {
					continue;
				}

				/*
				 * If the `key` is `AddCardToHand`, check if the previous history entry was `DrawCard`, and they both contained the exact same `val`.
				 * If so, ignore it.
				 */
				if (key === Event.AddCardToHand && historyIndex > 0) {
					const lastEntry = history[historyListIndex][historyIndex - 1];

					if (
						lastEntry[0] === Event.DrawCard &&
						(lastEntry[1] as Card).uuid === (value as Card).uuid
					) {
						continue;
					}
				}

				const shouldHide =
					game.config.advanced.hideValueHistoryKeys.includes(key) &&
					!flags?.debug;

				if (!hasPrintedHeader) {
					finished += `\nTurn ${historyListIndex} - ${player.getName()}\n`;
				}

				hasPrintedHeader = true;

				let newValue: string | undefined = "";

				if (Array.isArray(value)) {
					newValue = (
						await Promise.all(
							value.map(
								async (element) =>
									await doValue(element, game.player, shouldHide),
							),
						)
					).join(", ");
				} else {
					newValue = (
						await doValue(value, game.player, shouldHide)
					)?.toString();
				}

				finished += `${key}: ${newValue?.toString()}\n`;
			}
		}

		if (flags?.echo === false) {
			// Do nothing
		} else {
			console.log(finished);
			console.log();

			await game.pause();
		}

		return finished;
	},
};

export const debugCommands: CommandList = {
	async give(args): Promise<boolean> {
		if (args.length <= 0) {
			await game.pause("<red>Too few arguments.</red>\n");
			return false;
		}

		const cardName = args.join(" ");

		let cards = await Card.allFromName(cardName);
		if (cards.length <= 0) {
			// Check to see if there are ids starting with the input.
			cards = game.cards.filter((c) =>
				c.id.startsWith(cardName.replace(/^#/, "")),
			);
		}

		let card: Card | undefined = cards[0];

		// If there are multiple cards with the same name, ask the user to choose one.
		if (cards.length > 1) {
			const choice = await game.prompt.customSelect(
				`Multiple cards matching '${cardName}' found. Select one.`,
				await game.functions.card.readables(cards),
			);
			if (choice === "Back") {
				return false;
			}

			card = cards[parseInt(choice, 10)];
		}

		if (!card) {
			await game.pause(`<red>Invalid card: <yellow>${cardName}</yellow>.\n`);
			return false;
		}

		// Happy little bug that only happened to Player 2 :)
		card.owner = game.player;

		await game.player.addToHand(await card.imperfectCopy());
		return true;
	},

	async exit(): Promise<boolean> {
		game.running = false;
		return true;
	},

	async eval(args): Promise<boolean> {
		if (args.length <= 0) {
			await game.pause("<red>Too few arguments.</red>\n");
			return false;
		}

		const code = await game.functions.util.parseEvalArgs(args);
		console.log(`\`\`\`\nawait ${code}\n\`\`\`\n`);

		try {
			// biome-ignore lint/security/noGlobalEval: This is a security issue yes, but it's a debug command.
			await eval(code);
		} catch (error) {
			if (!(error instanceof Error)) {
				throw new TypeError("`error` is not an instance of Error");
			}

			console.log(
				"\n<red>An error happened while running this code! Here is the error:</red>",
			);

			// The stack includes "<anonymous>", which would be parsed as a tag, which would cause another error
			stopTagParsing();
			console.log(error.stack);
			resumeTagParsing();

			await game.pause();
		}

		await game.event.broadcast(Event.Eval, code, game.player);
		return true;
	},

	async rl(_, flags): Promise<boolean> {
		let success = true;

		success &&= await game.functions.interact.withStatus(
			"Reloading cards",
			async () => await Card.reloadAll(),
		);

		// Go through all the cards and reload them
		success &&= await game.functions.interact.withStatus(
			"Applying changes to existing cards",
			async () => {
				const uuids: string[] = [];

				for (const card of game.activeCards) {
					/*
					 * For some reason, without this, the game gets stuck on the `Frozen Test` card.
					 * It just loops over and over again on the same card with the same uuid,
					 * even if it reports that there are only 2 `Frozen Test` cards in `activeCards`.
					 * Very vexing...
					 */
					if (uuids.includes(card.uuid)) {
						continue;
					}

					uuids.push(card.uuid);
					await card.reload();
				}

				return true;
			},
		);

		success &&= await game.functions.interact.withStatus(
			"Reloading config",
			async () => await game.functions.util.importConfig(),
		);

		success &&= await game.functions.interact.withStatus(
			"Reloading language map",
			async () => Boolean(await game.functions.util.importLanguageMap(true)),
		);

		if (success) {
			if (flags?.debug) {
				return true;
			}

			console.log();
			await game.pause(
				"The cards have been reloaded.\nPress enter to continue...",
			);
			return true;
		}

		console.log();
		await game.pause(
			"Some steps failed. The game could not be fully reloaded. Please report this.\nPress enter to continue...",
		);

		return false;
	},

	async undo(): Promise<boolean> {
		// Get the last played card
		const playedCards = game.player.getPlayedCards();
		if (!game.event.events.PlayCard || playedCards.length <= 0) {
			await game.pause("<red>No cards to undo.</red>\n");
			return false;
		}

		const card = game.lodash.last(playedCards);
		if (!card) {
			await game.pause("<red>No cards found.</red>\n");
			return false;
		}

		// Remove the event so you can undo more than the last played card
		game.event.events.PlayCard[game.player.id].pop();

		// If the card can appear on the board, remove it.
		if (card.canBeOnBoard()) {
			game.functions.util.remove(game.player.board, card);

			// If the card has 0 or less health, restore it to its original health (according to the blueprint)
			if (card.type === Type.Minion && !card.isAlive()) {
				card.health = card.backups.init.health;
			} else if (card.type === Type.Location && card.durability! <= 0) {
				card.durability = card.backups.init.durability;
			}
		}

		// If the card is a weapon, destroy it before adding it to the player's hand.
		if (card.type === Type.Weapon) {
			await game.player.destroyWeapon();
		}

		// If the card is a hero, reset the player's hero to the default one from their class.
		if (card.type === Type.Hero) {
			await game.player.setToStartingHero();
		}

		await game.player.addToHand(card);
		game.player.refreshMana(card.cost);
		return true;
	},

	async ai(_, flags): Promise<string> {
		let finished = "";

		if (flags?.echo) {
			finished += "AI Info:\n\n";
		}

		for (let i = 0; i < 2; i++) {
			const player = Player.fromID(i);
			if (!player.ai) {
				continue;
			}

			finished += `AI${i + 1} History: {\n`;

			for (const [objectIndex, object] of player.ai.history.entries()) {
				finished += `${objectIndex + 1} ${object.type}: (${object.data}),\n`;
			}

			finished += "}\n";
		}

		if (flags?.echo === false) {
			// Do nothing
		} else {
			console.log(finished);
			console.log();

			await game.pause("Press enter to continue...");
		}

		return finished;
	},

	async history(): Promise<string> {
		return (await game.functions.interact.processCommand("history", {
			debug: true,
		})) as string;
	},

	async frl(): Promise<string> {
		return (await game.functions.interact.processCommand(
			`${game.config.advanced.debugCommandPrefix}rl`,
			{ debug: true },
		)) as string;
	},
};
