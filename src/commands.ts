import { Card } from "@Game/card.js";
import { Player } from "@Game/player.js";
import {
	Ability,
	type CommandList,
	Event,
	Keyword,
	TargetAlignment,
	TargetFlag,
	Type,
	type UnknownEventValue,
	UseLocationError,
} from "@Game/types.js";
import { resumeTagParsing, stopTagParsing } from "chalk-tags";

/*
 * This is the list of commands that can be used in the game.
 * This will be shown when using the "help" command.
 */
const helpBricks = [
	"(name) - (description)\n",

	"end - End your turn",
	"attack - Attack a target",
	"hero power - Use your hero power",
	"history - Show a list of actions that have happened",
	"concede - Forfeit the game",
	"view - View additional information about a card",
	"use - Use a location card",
	"titan - Use a titan card",
	"detail - Get more details about the game",
	"help - Show this message",
	"version - Show information about the version, branch, and settings of this game",
	"license - Open a link to this project's license",
];

/*
 * This is the list of debug commands that can be used in the game.
 * This will also be shown when using the "help" command.
 */
const helpDebugBricks = [
	"(name) (required) [optional] - (description)\n",

	"give (name | id) - Add a card to your hand",
	"eval [log] (code) - Run some code",
	"exit - Force exit the game. There will be no winner, and it will take you straight back to the hub",
	"history - Show a list of actions that have happened. Unlike the normal history command, this doesn't hide any information, and is the same thing the log files uses",
	"rl - Reload the cards, config, and translation files",
	"frl - Do the same thing as 'rl', but doesn't wait for you to press enter before continuing",
	"undo - Undo the last card played. It gives the card back to your hand, and removes it from where it was. (This does not undo the actions of the card)",
	"ai - Give you a list of the actions the ai(s) have taken in the order they took it",
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

		if (game.player.mana < (game.player.hero.heropower?.cost ?? 0)) {
			await game.pause("<red>You do not have enough mana.</red>\n");
			return false;
		}

		if (game.player.hasUsedHeroPowerThisTurn) {
			await game.pause(
				"<red>You have already used your hero power this turn.</red>\n",
			);

			return false;
		}

		if (game.player.disableHeroPower) {
			await game.pause("<red>Your hero power is currently disabled.</red>\n");
			return false;
		}

		await game.functions.interact.print.gameState(game.player);
		const ask = await game.functions.interact.prompt.yesNo(
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
		await game.functions.interact.prompt.gameloopAttack();
		return true;
	},

	async use(): Promise<boolean> {
		// Use location
		const errorCode = await game.functions.interact.prompt.useLocation();
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
		const card = await game.functions.interact.prompt.targetCard(
			"Which card do you want to use?",
			undefined,
			TargetAlignment.Friendly,
		);

		if (!card) {
			return false;
		}

		if (card.sleepy) {
			await game.pause("<red>That card is exhausted.</red>\n");
			return false;
		}

		const titanIds = card.getKeyword(Keyword.Titan) as number[] | undefined;

		if (!titanIds) {
			await game.pause("<red>That card is not a titan.</red>\n");
			return false;
		}

		const titanCards = await Promise.all(
			titanIds.map(async (id) => Card.create(id, game.player, true)),
		);

		await game.functions.interact.print.gameState(game.player);
		console.log(
			"\nWhich ability do you want to trigger?\n%s",
			titanCards.map((c) => c.readable).join(",\n"),
		);

		const choice = game.lodash.parseInt(await game.input());

		if (
			!choice ||
			choice < 1 ||
			choice > titanCards.length ||
			Number.isNaN(choice)
		) {
			await game.pause("<red>Invalid choice.</red>\n");
			return false;
		}

		const ability = titanCards[choice - 1];

		if ((await ability.activate(Ability.Cast)) === Card.REFUND) {
			await game.event.withSuppressed(Event.DiscardCard, async () =>
				ability.discard(),
			);

			return false;
		}

		titanIds.splice(choice - 1, 1);

		card.setKeyword(Keyword.Titan, titanIds);

		if (titanIds.length <= 0) {
			card.remKeyword(Keyword.Titan);
		} else {
			card.sleepy = true;
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

		const bricks = helpBricks.map((brick) => game.logger.translate(brick));
		const wall = game.functions.util.createWall(bricks, "-");

		const debugBricks = helpDebugBricks.map((brick) =>
			game.logger.translate(brick),
		);
		const debugWall = game.functions.util.createWall(debugBricks, "-");

		// Normal commands
		for (const brick of wall) {
			console.log(brick);
		}

		const condColor = (text: string) =>
			// We can't use `game.functions.color.if` here since the text should be uncolored if the condition is met.
			game.config.general.debug ? text : `<gray>${text}</gray>`;

		const debugEnabled = game.config.general.debug
			? "<bright:green>ON</bright:green>"
			: "<red>OFF</red>";

		console.log(condColor(`\n--- Debug Commands (${debugEnabled}) ---`));

		// Debug Commands
		for (const brick of debugWall) {
			console.log(condColor(game.config.advanced.debugCommandPrefix + brick));
		}

		console.log(
			condColor(
				`---------------------------${game.config.general.debug ? "" : "-"}`,
			),
		);

		await game.pause("\nPress enter to continue...\n");
		return true;
	},

	async view(): Promise<boolean> {
		const isHandAnswer = await game.functions.interact.prompt.chooseFromList(
			game.player,
			"Do you want to view a minion on the board, or in your hand?",
			["Board", "Hand"],
		);

		const isHand = isHandAnswer === "Hand";

		if (!isHand) {
			// AllowLocations Makes selecting location cards allowed. This is disabled by default to prevent, for example, spells from killing the card.
			const card = await game.functions.interact.prompt.targetCard(
				"Which minion do you want to view?",
				undefined,
				TargetAlignment.Any,
				[TargetFlag.AllowLocations],
			);

			if (!card) {
				return false;
			}

			await card.view();
			return true;
		}

		// View minion on the board
		const cardIndex = await game.input("\nWhich card do you want to view? ");
		if (!cardIndex || !game.lodash.parseInt(cardIndex)) {
			return false;
		}

		const card = game.player.hand[game.lodash.parseInt(cardIndex) - 1];

		await card.view();
		return true;
	},

	async detail(): Promise<boolean> {
		game.player.detailedView = !game.player.detailedView;
		return true;
	},

	async concede(): Promise<boolean> {
		await game.functions.interact.print.gameState(game.player);

		const confirmation = await game.functions.interact.prompt.yesNo(
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
		strbuilder += `, with latest commit hash <yellow>${game.functions.info.latestCommit()}</yellow>,`;

		if (game.config.general.debug && game.config.ai.player2) {
			strbuilder += " using the <yellow>debug settings</yellow> preset";
		} else if (!game.config.general.debug && !game.config.ai.player2) {
			strbuilder += " using the <yellow>recommended settings</yellow> preset";
		} else {
			strbuilder += " using custom settings";
		}

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

		const openIssues = await game.functions.interact.prompt.yesNo(
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
		const { history } = game.event;
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
				// Return value as-is if it is not a card / player
				return value;
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

					// This shouldn't happen?
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
			let hasPrintedHeader = false;
			let previousPlayer: Player | undefined;

			for (const [historyIndex, historyKey] of historyList.entries()) {
				let [key, value, player] = historyKey;
				if (!player) {
					// TODO: Maybe throw an error. #277
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

				value = (await doValue(
					value,
					game.player,
					shouldHide,
				)) as UnknownEventValue;

				if (Array.isArray(value)) {
					let strbuilder = "";

					for (let v of value) {
						v = (await doValue(v, game.player, shouldHide)) as
							| string
							| number
							| Player
							| Card
							| TargetFlag[]
							| undefined;

						strbuilder += `${v?.toString()}, `;
					}

					strbuilder = strbuilder.slice(0, -2);
					value = strbuilder;
				}

				const finishedKey = game.lodash.capitalize(key);

				finished += `${finishedKey}: ${value?.toString()}\n`;
			}
		}

		if (flags?.echo === false) {
			// Do nothing
		} else {
			console.log(finished);

			await game.pause("\nPress enter to continue...");
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

		// TODO: Get all cards from the name and ask the user which one they want. #277
		const card = await Card.fromName(cardName, game.player);
		if (!card) {
			await game.pause(`<red>Invalid card: <yellow>${cardName}</yellow>.\n`);
			return false;
		}

		await game.player.addToHand(card);
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
		console.log(`Running: ${code}\n`);

		try {
			// biome-ignore lint/security/noGlobalEval: This is a security issue yes, but it's a debug command.
			eval(code);
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
			async () => Card.reloadAll(),
		);

		// Go through all the cards and reload them
		success &&= await game.functions.interact.withStatus(
			"Applying changes to existing cards",
			async () => {
				// Hand and decks of the players
				for (const player of [game.player1, game.player2]) {
					for (const card of player.hand) {
						await card.reload();
					}

					for (const card of player.deck) {
						await card.reload();
					}

					for (const card of player.board) {
						await card.reload();
					}

					for (const card of player.graveyard) {
						await card.reload();
					}
				}

				return true;
			},
		);

		success &&= await game.functions.interact.withStatus(
			"Reloading config",
			async () => game.functions.util.importConfig(),
		);

		success &&= await game.functions.interact.withStatus(
			"Reloading language map",
			async () => Boolean(game.functions.util.getLanguageMap(true)),
		);

		if (success) {
			if (flags?.debug) {
				return true;
			}

			await game.pause(
				"\nThe cards have been reloaded.\nPress enter to continue...",
			);
			return true;
		}

		await game.pause(
			"\nSome steps failed. The game could not be fully reloaded. Please report this.\nPress enter to continue...",
		);

		return false;
	},

	async undo(): Promise<boolean> {
		// Get the last played card
		if (
			!game.event.events.PlayCard ||
			game.event.events.PlayCard[game.player.id].length <= 0
		) {
			await game.pause("<red>No cards to undo.</red>\n");
			return false;
		}

		const eventCards: Array<[Card, number]> =
			game.event.events.PlayCard[game.player.id];

		if (eventCards.length <= 0) {
			await game.pause("<red>No cards to undo.</red>\n");
			return false;
		}

		let card = game.lodash.last(eventCards)?.[0];
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
				card.health = card.storage.init.health;
			} else if (card.type === Type.Location && (card.durability ?? 0) <= 0) {
				card.durability = card.storage.init.durability;
			}
		}

		card = card.perfectCopy();

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

			await game.pause("\nPress enter to continue...");
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
