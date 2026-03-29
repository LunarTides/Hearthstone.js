import { SentimentAI, SimulationAI } from "@Game/ai.ts";
import { Card } from "@Game/card.ts";
import { eventManager, historyTree } from "@Game/modules/event.ts";
import { Player } from "@Game/player.ts";
import {
	Ability,
	type Blueprint,
	Event,
	type GameAttackFlags,
	type GameAttackReturn,
	type GameConfig,
	GamePlayCardReturn,
	Keyword,
	Location,
	RemoveReason,
	Tag,
	type Target,
	Type,
} from "@Game/types.ts";

import _ from "lodash";
import { register } from "universe/emergence/register/lib.ts";
import cardIds from "../cards/ids.ts";
import { attack } from "./modules/attack.ts";
import { audio } from "./modules/audio/audio.ts";
import { card } from "./modules/card/index.ts";
import { playCard } from "./modules/card/play.ts";
import { color } from "./modules/color.ts";
import { config as configuration } from "./modules/config.ts";
import { data } from "./modules/data.ts";
import { deckcode } from "./modules/deckcode.ts";
import { fileSystem } from "./modules/fs.ts";
import { info } from "./modules/info.ts";
import { interact } from "./modules/interact/index.ts";
import { logfile } from "./modules/logfile.ts";
import { os } from "./modules/os.ts";

export class Game {
	/**
	 * Audio module.
	 */
	audio = audio;

	/**
	 * Card module.
	 */
	card = card;

	/**
	 * Configuration module.
	 */
	configuration = configuration;

	/**
	 * Color module.
	 */
	color = color;

	/**
	 * Data manipulation module.
	 */
	data = data;

	/**
	 * Deckcode module.
	 */
	deckcode = deckcode;

	/**
	 * File system module.
	 */
	fs = fileSystem;

	/**
	 * Info module.
	 */
	info = info;

	/**
	 * Interact module.
	 */
	interact = interact;

	/**
	 * Logfile module.
	 */
	logfile = logfile;

	/**
	 * OS module.
	 */
	os = os;

	/**
	 * Shortcut for `game.interact.prompt`.
	 */
	prompt = interact.prompt;

	/**
	 * The player that starts first.
	 */
	player1: Player;

	/**
	 * The player that starts with `The Coin`.
	 */
	player2: Player;

	/**
	 * The player whose turn it is.
	 */
	player: Player;

	/**
	 * The opponent of the player whose turn it is.
	 *
	 * Same as `game.player.getOpponent()`.
	 */
	opponent: Player;

	/**
	 * Event & History managment and tracker.
	 */
	event = eventManager;

	/**
	 * Debug information saved to the log files.
	 */
	debugLog: string[] = [];

	/**
	 * Some configuration for the game.
	 *
	 * Look in the `config` folder.
	 */
	config: GameConfig; /**
	 * All of the blueprints cards that have been implemented so far.
	 * Don't use this if you don't know what you're doing.
	 *
	 * Use `Card.all()` or `Card.pool()` instead.
	 */
	blueprints: Blueprint[] = [];

	/**
	 * All of the cards that have been implemented so far.
	 *
	 * Use `Card.all()` or `Card.pool()` instead.
	 */
	cards: Card[] = [];

	/**
	 * All of the cards that are currently active.
	 * This means that they are being referenced somewhere.
	 */
	activeCards: Card[] = [];

	/**
	 * The turn counter.
	 *
	 * This goes up at the beginning of each player's turn.
	 *
	 * This means that, for example, if `Player 1`'s turn is on turn 0, then when it's `Player 1`'s turn again, the turn counter is 2.
	 *
	 * Do
	 * ```
	 * game.turnCounter();
	 * ```
	 * for a more conventional turn counter.
	 */
	turn = 0;

	/**
	 * If this is true, the game will not accept input from the user, and so the user can't interact with the game. This will most likely cause an infinite loop, unless both players are ai's.
	 */
	noInput = false;

	/**
	 * If this is true, the game will not output anything to the console.
	 */
	noOutput = false;

	isSimulation = false;

	/**
	 * If the game is currently running.
	 *
	 * If this is false, the game loop will end.
	 */
	running = true;

	/**
	 * Cache for the game.
	 */
	cache: Record<string, any> = {};

	time = {
		year: 0,

		events: {
			anniversary: false,

			pride: {
				month: false,
				agender: false,
				aro: false,
				ace: false,
				bi: false,
				genderfluid: false,
				intersex: false,
				lesbian: false,
				enby: false,
				pan: false,
				trans: false,
			},
		},
	};

	lodash = _;
	ids = cardIds;

	/**
	 * Sets up the game by assigning players and initializing game state.
	 *
	 * @param player1 The first player.
	 * @param player2 The second player.
	 */
	constructor(player1: Player, player2: Player) {
		globalThis.game = this;

		// Choose a random player to be player 1 and player 2
		if (this.lodash.random(0, 1)) {
			this.player1 = player1;
			this.player2 = player2;
		} else {
			this.player1 = player2;
			this.player2 = player1;
		}

		// Set the starting players
		this.player = this.player1;
		this.opponent = this.player2;

		// Set the player's ids
		this.player1.id = 0;
		this.player2.id = 1;

		// Check if the date is the 14th of February
		const currentDate = new Date();
		this.time.year = currentDate.getFullYear();
		this.configuration.setupTimeEvents(currentDate);

		// this.time.events.anniversary = true;
		// this.time.events.pride.month = true;
	}

	/**
	 * Ask the user a question and returns their answer
	 *
	 * @param prompt The question to ask
	 * @param care If this is false, it overrides `game.noInput`. Only use this when debugging.
	 *
	 * @returns What the user answered
	 */
	input = this.interact.input;

	/**
	 * Pause the game until the user presses the enter key.
	 * Use this instead of `input` if you don't care about the return value for clarity.
	 *
	 * @param [prompt="Press enter to continue..."] The prompt to show the user
	 */
	async pause(prompt = "Press enter to continue..."): Promise<void> {
		await this.interact.input({ message: prompt });
	}

	/**
	 * @example
	 * game.interest("Starting...");
	 * assert.equal(game.debugLog[0], "Starting...");
	 * game.interest("Something else");
	 * assert.equal(game.debugLog[1], "Something else");
	 *
	 * game.interest("Starting...OK");
	 * assert.equal(game.debugLog[0], "Starting...OK");
	 * assert.equal(game.debugLog[1], "Something else");
	 */
	interest(...data: string[]): void {
		for (const string of data) {
			if (typeof string !== "string") {
				continue;
			}

			const split = `${string.split("...")[0]}...`;
			if (this.debugLog.includes(split)) {
				this.debugLog.splice(this.debugLog.indexOf(split), 1, string);

				game.data.remove(data, string);
			}
		}

		this.debugLog.push(...data);
	}

	/**
	 * Assigns an ai to the players if in the config.
	 *
	 * Unassigns the player's ai's if not in the config.
	 *
	 * @returns Success
	 */
	doConfigAi(): boolean {
		let setRandomAI = false;

		for (const player of [this.player1, this.player2]) {
			if (player.ai) {
				continue;
			}

			// HACK: Use of never. Might not update correctly if the config format is changed
			if (this.config.ai[`player${player.id + 1}` as never]) {
				let ai: SentimentAI | SimulationAI;

				const model = this.config.ai[`player${player.id + 1}Model` as never];
				if (model === "sentiment") {
					ai = new SentimentAI(player);
				} else if (model === "simulation") {
					ai = new SimulationAI(player);
				} else {
					throw new Error(`"${model}" is not a valid AI model.`);
				}

				player.ai = ai;
			}

			if (this.config.ai.random && !setRandomAI && this.lodash.random() > 0.5) {
				setRandomAI = true;
				player.ai = new SentimentAI(player);
			}
		}

		return true;
	}

	/**
	 * Returns if a time-based event is currently active.
	 *
	 * @param event Pass something in `game.time.events` here.
	 */
	isEventActive(event: boolean): boolean {
		// return true; // CHAOS CHAOS!!!
		return event && !this.config.general.disableEvents;
	}

	/**
	 * Returns if the supplied debug setting is enabled.
	 * This accounts for 'Debug > All'
	 */
	isDebugSettingEnabled(setting: boolean): boolean {
		return setting || this.config.debug.all;
	}

	/**
	 * @returns A clone of the game. This is creates a deep clone of the game.
	 */
	async createSnapshot(): Promise<Game> {
		const snapshot = this.lodash.cloneDeepWith(this, (value, key, object) => {
			// TODO: Customize
		});
		return snapshot;
	}

	/**
	 * Applies a snapshot as the current game.
	 */
	useSnapshot(snapshot: Game) {
		game = snapshot;
	}

	/**
	 * Run code in an isolated snapshot. The effects of the code will not carry over outside the callback.
	 *
	 * @param callback The code to run
	 */
	async dryRun(callback: () => Promise<void>) {
		const current = await this.createSnapshot();
		const snapshot = await this.createSnapshot();

		this.useSnapshot(snapshot);
		await callback();
		this.useSnapshot(current);
	}

	// Start / End

	/**
	 * Starts the game
	 *
	 * @returns Success
	 */
	async startGame(): Promise<boolean> {
		// Make players draw cards
		for (let i = 0; i < 2; i++) {
			const player = Player.fromID(i);

			// Suppress "AddCardToHand" and "DrawCard" events in the loop since the events need to be unsuppressed by the time any `card.activate` is called
			const unsuppressAddCardToHand = this.event.suppress(Event.AddCardToHand);
			const unsuppressDrawCard = this.event.suppress(Event.DrawCard);

			// Set the player's hero to the starting hero for the class
			const success = await player.setToStartingHero();
			if (!success) {
				// The starting hero for that class doesn't exist
				throw new Error(
					`No starting hero associated with the class '${player.heroClass}' found. Please create a hero with this class, and give it the 'StartingHero' tag. Error Code: 12`,
				);
			}

			/*
			 * Add quest cards to the player's hand.
			 */
			for (const card of player.deck) {
				if (card.tags.includes(Tag.Quest)) {
					await player.drawSpecific(card);
				}
			}

			// Draw 3-4 cards
			const amountOfCards = player.id === 0 ? 3 : 4;

			// This accounts for the quest cards
			await player.drawCards(amountOfCards - player.hand.length);

			unsuppressAddCardToHand();
			unsuppressDrawCard();

			for (const card of player.deck) {
				await card.trigger(Ability.StartOfGame);
			}

			for (const card of player.hand) {
				await card.trigger(Ability.StartOfGame);
			}
		}

		/*
		 * Set the starting mana for the first player.
		 * The second player will get this when their turn starts.
		 */
		this.player1.emptyMana = 1;
		this.player1.mana = 1;

		// Give the coin to the second player
		const coin = await Card.create(
			this.ids.Official.builtin.the_coin[0],
			this.player2,
		);

		await this.event.withSuppressed(Event.AddCardToHand, async () =>
			this.player2.addToHand(coin),
		);

		this.turn += 1;
		return true;
	}

	/**
	 * Ends the game and declares `winner` as the winner
	 *
	 * @param winner The winner
	 *
	 * @returns Success
	 */
	async endGame(winner: Player): Promise<boolean> {
		if (!winner || this.isSimulation) {
			return false;
		}

		// The game has already ended.
		if (!this.running) {
			return true;
		}

		this.interact.print.watermark();
		console.log();

		const history = await this.interact.processCommand("history", {
			// Do this to bypass 'Press enter to continue' prompt when showing history
			echo: false,
		});

		console.log(history);
		await this.pause(`${winner.getName()} wins!\n`);

		this.running = false;
		return true;
	}

	/**
	 * Ends the players turn and starts the opponents turn
	 *
	 * @returns Success
	 */
	async endTurn(): Promise<boolean> {
		game.event.newHistoryChild(Event.EndTurn, this.turn, this.player);

		// Everything after this comment happens when the player's turn ends
		const player = this.player;
		const opponent = this.opponent;

		// Ready the minions for the next turn.
		for (const card of player.board) {
			card.ready();
		}

		// Remove echo cards
		player.hand = player.hand.filter((c) => !c.hasKeyword(Keyword.Echo));
		player.canAttack = true;

		// Trigger unspent mana
		if (player.mana > 0) {
			await this.event.broadcast(Event.UnspentMana, player.mana, player);
		}

		await this.event.broadcast(Event.EndTurn, this.turn, player);
		game.event.finishHistoryChild();

		// Everything after this comment happens when the opponent's turn starts
		this.turn++;
		game.event.newHistoryChild(Event.StartTurn, this.turn, opponent);

		// Mana stuff
		opponent.addEmptyMana(1);
		opponent.mana = opponent.emptyMana - opponent.overload;
		opponent.overload = 0;
		opponent.attack = 0;

		// Weapon stuff
		if (opponent.weapon?.attack && opponent.weapon.attack > 0) {
			opponent.attack = opponent.weapon.attack;
			opponent.weapon.ready();
		}

		// Chance to spawn in a diy card
		if (
			this.lodash.random(0, 1, true) <=
				this.config.advanced.diyCardSpawnChance &&
			this.config.advanced.spawnInDiyCards
		) {
			await opponent.spawnInDIYCard();
		}

		// Minion start of turn
		for (const card of opponent.board) {
			// Dormant
			const dormant = card.getKeyword(Keyword.Dormant) as number | undefined;

			if (dormant) {
				// If the current turn is less than the dormant value, do nothing
				if (this.turn <= dormant) {
					continue;
				}

				// Remove dormant
				card.removeKeyword(Keyword.Dormant);
				card.exhaust();

				/*
				 * Set the card's turn to this turn.
				 * TODO: Should this happen? #277
				 */
				// card.turnCreated = this.turn;

				// HACK: If the battlecry use a function that depends on `game.player`
				this.player = opponent;
				this.opponent = player;
				await card.trigger(Ability.Battlecry);
				this.player = player;
				this.opponent = opponent;

				continue;
			}

			card.canAttackHero = true;
			card.removeKeyword(Keyword.Frozen);

			card.ready();

			// Stealth duration
			if (
				card.stealthDuration &&
				card.stealthDuration > 0 &&
				this.turn > card.stealthDuration
			) {
				card.stealthDuration = 0;
				card.removeKeyword(Keyword.Stealth);
			}

			// Location cooldown
			if (card.type === Type.Location && card.cooldown && card.cooldown > 0) {
				card.cooldown--;
			}
		}

		// Draw card
		await opponent.drawCards(1);

		opponent.hasUsedHeroPowerThisTurn = false;

		// Swap the current and opposing players.
		this.player = opponent;
		this.opponent = player;

		await this.event.broadcast(Event.StartTurn, this.turn, opponent);

		game.event.finishHistoryChild();
		return true;
	}

	/**
	 * Returns a more traditional turn counter format.
	 *
	 * `game.turns` increments at the end of every player's turn.
	 * This only increments at the end of the second player's turn.
	 */
	turnCounter(): number {
		return Math.ceil(game.turn / 2);
	}

	/**
	 * Gets a random target from the game. All arguments default to true.
	 *
	 * @param includePlayer1 If it should include `game.player1` in the list of targets.
	 * @param includePlayer2 If it should include `game.player2` in the list of targets.
	 * @param includePlayer1Board If it should include player1's board in the list of targets.
	 * @param includePlayer2Board If it should include player2's board in the list of targets.
	 * @param [filter=() => true] Filter predicate.
	 */
	randomTarget(
		includePlayer1 = true,
		includePlayer2 = true,
		includePlayer1Board = true,
		includePlayer2Board = true,
		filter: (target: Target) => boolean = () => true,
	): Target | undefined {
		const targets: Target[] = [];

		if (includePlayer1) {
			targets.push(game.player1);
		}

		if (includePlayer2) {
			targets.push(game.player2);
		}

		if (includePlayer1Board) {
			targets.push(...game.player1.board);
		}

		if (includePlayer2Board) {
			targets.push(...game.player2.board);
		}

		return game.lodash.sample(targets.filter(filter));
	}

	/**
	 * The same as `getRandomTarget` but uses relative terms (current & opposing) rather than absolute terms (player1 & player2).
	 */
	randomTargetRelative(
		includeCurrentPlayer = true,
		includeOpposingPlayer = true,
		includeCurrentBoard = true,
		includeOpposingBoard = true,
		filter: (target: Target) => boolean = () => true,
	): Target | undefined {
		return this.randomTarget(
			(includeCurrentPlayer && game.player.id === 0) ||
				(includeOpposingPlayer && game.opponent.id === 0),
			(includeCurrentPlayer && game.player.id === 1) ||
				(includeOpposingPlayer && game.opponent.id === 1),
			(includeCurrentBoard && game.player.id === 0) ||
				(includeOpposingBoard && game.opponent.id === 0),
			(includeCurrentBoard && game.player.id === 1) ||
				(includeOpposingBoard && game.opponent.id === 1),
			filter,
		);
	}

	/**
	 * Play a card
	 *
	 * @param card The card to play
	 * @param player The card's owner
	 */
	@historyTree
	async play(card: Card, player: Player) {
		return await playCard.play(card, player);
	}

	/**
	 * Makes a minion or hero attack another minion or hero
	 *
	 * @param attacker attacker | Amount of damage to deal
	 * @param target The target
	 * @param force Whether to force the attack. This will bypass any attack restrictions. By default, this is false.
	 *
	 * @returns Success | Errorcode
	 */
	async attack(
		attacker: Target | number,
		target: Target,
		flags: GameAttackFlags = {},
	): Promise<GameAttackReturn> {
		// Create history branch.
		if (typeof attacker === "number") {
			if (target instanceof Card) {
				game.event.newHistoryChild(
					Event.DamageCard,
					[target, attacker],
					target.owner,
				);
			} else {
				game.event.newHistoryChild(Event.TakeDamage, attacker, target);
			}
		} else {
			game.event.newHistoryChild(
				Event.Attack,
				[attacker, target, flags],
				attacker instanceof Player ? attacker : attacker.owner,
			);
		}

		const result = await attack.attack(attacker, target, flags);

		game.event.finishHistoryChild();
		return result;
	}

	/**
	 * Summon a minion.
	 * Broadcasts the `SummonCard` event
	 *
	 * @param card The minion to summon
	 * @param player The player who gets the minion
	 * @param colossal If the minion has colossal, summon the other minions.
	 *
	 * @returns The minion summoned
	 */
	@historyTree
	async summon(
		card: Card,
		player: Player,
		colossal = true,
	): Promise<GamePlayCardReturn> {
		game.event.newHistoryChild(Event.SummonCard, card, player);

		if (!card.canBeOnBoard()) {
			return GamePlayCardReturn.Invalid;
		}

		// If the board has max capacity, and the card played is a minion or location card, prevent it.
		if (player.board.length >= game.config.general.maxBoardSpace) {
			return GamePlayCardReturn.Space;
		}

		player.spellDamage = 0;

		if (
			card.hasKeyword(Keyword.Charge) ||
			card.hasKeyword(Keyword.Rush) ||
			card.hasKeyword(Keyword.Titan)
		) {
			card.ready();
		}

		if (card.hasKeyword(Keyword.Rush)) {
			card.canAttackHero = false;
		}

		const dormant = card.getKeyword(Keyword.Dormant) as number | undefined;

		const colossalMinionIds = card.getKeyword(Keyword.Colossal) as
			| string[]
			| undefined;

		if (colossalMinionIds && colossal) {
			/*
			 * Minion.colossal is an id array.
			 * example: [game.ids.Official.examples.left_arm[0], game.ids.null, game.ids.Official.examples.right_arm[0]]
			 * the `null` gets replaced with the main minion
			 */

			const unsuppress = game.event.suppress(Event.SummonCard);

			for (const cardId of colossalMinionIds) {
				if (cardId === this.ids.null) {
					// Summon this minion without triggering colossal again
					await player.summon(card, false);
					continue;
				}

				const cardToSummon = await Card.create(cardId, player);

				// If this card has dormant, add it to the summoned minions as well.
				if (dormant) {
					cardToSummon.addKeyword(Keyword.Dormant, dormant);
				}

				await player.summon(cardToSummon);
			}

			unsuppress();

			/*
			 * Return since we already handled the main minion up in the "cardId <= 0" if statement
			 * You should probably just ignore this error code
			 */
			return GamePlayCardReturn.Colossal;
		}

		if (dormant) {
			/*
			 * Oh no... Why is this not documented?
			 *
			 * If the minion that got summoned has dormant, it sets the dormant value to itself plus the current turn.
			 * This is so that the game can know when to remove the dormant by checking which turn it is.
			 * We should really document this somewhere, since it can easily be overriden by a card after it has been summoned, which would cause unexpected behavior.
			 */
			card.setKeyword(Keyword.Dormant, dormant + game.turn);
			card.addKeyword(Keyword.Immune);

			// TODO: Why are we readying the dormant minion? #277
			card.ready();
		}

		player.board.push(card);
		await card.setLocation(Location.Board);

		// Calculate new spell damage
		for (const card of player.board) {
			if (card.spellDamage) {
				player.spellDamage += card.spellDamage;
			}
		}

		await game.event.broadcast(Event.SummonCard, card, player);
		return GamePlayCardReturn.Success;
	}

	/**
	 * Kill all minions with 0 or less health
	 *
	 * @returns The amount of minions killed
	 */
	async killCardsOnBoard(): Promise<number> {
		let amount = 0;

		for (let p = 0; p < 2; p++) {
			const player = Player.fromID(p);

			/*
			 * The minions with more than 0 health will be added to this list.
			 * The player's side of the board will be set to this list at the end.
			 * This will effectively remove all minions with 0 or less health from the board
			 */
			const spared: Card[] = [];

			// Trigger the deathrattles before doing the actual killing so the deathrattles can save the card by setting it's health to above 0
			for (const card of player.board) {
				if (card.isAlive()) {
					continue;
				}

				await card.trigger(Ability.Deathrattle);
			}

			for (const card of player.board) {
				// Add minions with more than 0 health to `spared`.
				if (card.isAlive()) {
					spared.push(card);
					continue;
				}

				// Calmly tell the minion that it is going to die
				const removeReturn = await card.trigger(
					Ability.Remove,
					RemoveReason.Destroy,
				);

				// If the "remove" ability returns false, the card is not removed from the board
				if (Array.isArray(removeReturn) && removeReturn.includes(false)) {
					spared.push(card);
					continue;
				}

				card.turnKilled = this.turn;
				amount++;

				player.corpses++;
				player.graveyard.push(card);
				await card.setLocation(Location.Graveyard);

				await this.event.broadcast(Event.DestroyCard, card, this.player);

				if (!card.hasKeyword(Keyword.Reborn)) {
					continue;
				}

				// Reborn
				const minion = await card.imperfectCopy();
				minion.removeKeyword(Keyword.Reborn);

				// Reduce the minion's health to 1, keep the minion's attack the same
				await minion.setStats(minion.attack, 1);

				/*
				 * Suppress the event here since we activate some abilities on the minion further up.
				 * This isn't great performance wise, but there's not much we can do about it.
				 * Although the performance hit is only a few milliseconds in total every time (This function does get called often), so there's bigger performance gains to be had elsewhere.
				 */
				await this.event.withSuppressed(Event.SummonCard, async () =>
					this.summon(minion, player),
				);

				/*
				 * Activate the minion's passive
				 * We're doing this because otherwise, the passive won't be activated this turn
				 * Normally when we summon a minion, it will be activated immediately, since the `PlayCard` event gets triggered immediately after playing the card
				 * but this is not the case here, since we are directly summoning the minion, and we told it to not broadcast the event.
				 * The `reborn` string is passed in order for the card to know why the passive was triggered. The card can explicitly look for the `reborn` string
				 * in its passive.
				 * So it looks like this:
				 * minion.activate(key, reason, minion);
				 */
				await minion.trigger(Ability.Passive, "reborn", card, this.player);

				spared.push(minion);
			}

			player.board = spared;
		}

		return amount;
	}
}

/**
 * Creates a new game instance, initializes players, sets up the game, imports all cards, and configures AI.
 *
 * @param [registerResources=true] Whether to register all resources. Disable for optimization purposes.
 *
 * @returns An object containing the game instance, player 1, and player 2.
 */
export async function createGame(registerResources = true) {
	const player1 = new Player();
	const player2 = new Player();
	const game = new Game(player1, player2);
	await game.configuration.import();
	game.doConfigAi();
	if (registerResources) {
		await register();
	}

	return { game, player1, player2 };
}

declare global {
	/**
	 * The global game
	 */
	var game: Game;
}
