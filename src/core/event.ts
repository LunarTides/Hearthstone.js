import { Card, Player } from "@Game/internal.js";
import type {
	EventKey,
	EventManagerEvents,
	HistoryKey,
	TickHookCallback,
	UnknownEventValue,
} from "@Game/types.js";

type EventManagerType = {
	listeners: Record<number, TickHookCallback>;
	listenerCount: number;
	tickHooks: TickHookCallback[];
	history: Record<number, HistoryKey[]>;
	events: EventManagerEvents;
	suppressed: EventKey[];
	forced: EventKey[];
	stats: Record<string, [number, number]>;

	tick(
		key: EventKey,
		value: UnknownEventValue,
		player: Player,
	): Promise<boolean>;
	cardUpdate(
		key: EventKey,
		value: UnknownEventValue,
		player: Player,
	): Promise<boolean>;
	questUpdate(
		questsName: "secrets" | "sidequests" | "quests",
		key: EventKey,
		value: UnknownEventValue,
		player: Player,
	): Promise<boolean>;
	broadcast(
		key: EventKey,
		value: UnknownEventValue,
		player: Player,
		updateHistory?: boolean,
	): Promise<boolean>;
	addHistory(key: EventKey, value: UnknownEventValue, player: Player): void;
	broadcastDummy(player: Player): Promise<boolean>;
	increment(player: Player, key: string, amount?: number): number;
};

export const eventManager: EventManagerType = {
	/**
	 * The event listeners that are attached to the game currently.
	 */
	listeners: {},

	/**
	 * The amount of event listeners that have been added to the game, this never decreases.
	 */
	listenerCount: 0,

	/**
	 * The hooks that will be run when the game ticks.
	 */
	tickHooks: [],

	/**
	 * The history of the game.
	 *
	 * It looks like this: `history[turn] = [[key, val, player], ...]`
	 */
	history: {},

	/**
	 * Used like this:
	 * ```ts
	 * events[key] = {player1id: [[val1, turn], [val2, turn], [val3, turn], ...], player2id: [...]};
	 * ```
	 */
	events: {},

	/**
	 * A list of event keys to suppress.
	 *
	 * If an event with a key in this list is broadcast, it will add it to the history, and tick the game, but will not activate any passives / event listeners.
	 */
	suppressed: [],

	/**
	 * A list of event keys to never suppress.
	 */
	forced: [],

	/**
	 * Some general stats for each player.
	 */
	stats: {},

	/**
	 * Tick the game
	 *
	 * @param key The key of the event that triggered the tick
	 * @param value The value of the event that triggered the tick
	 * @param player The player that triggered the tick
	 */
	async tick(key, value, player): Promise<boolean> {
		/*
		 * The code in here gets executed very often
		 * So don't do any expensive stuff here
		 */

		// Infuse
		if (key === "KillCard") {
			for (const card of player.hand) {
				await card.tryInfuse();
			}
		}

		for (let i = 0; i < 2; i++) {
			const player = Player.fromID(i);

			for (const card of player.hand) {
				await card.condition();

				// Just in case. Remove for small performance boost
				card.applyEnchantments();

				await card.activate("handtick", key, value, player);
				if (card.cost < 0) {
					card.cost = 0;
				}
			}

			for (const card of player.board) {
				if (card.type === "Minion" && !card.isAlive()) {
					continue;
				}

				await card.activate("tick", key, value, player);
			}
		}

		for (const hook of this.tickHooks) {
			await hook(key, value, player);
		}

		return true;
	},

	/**
	 * Do card passives
	 *
	 * @param key The key of the event
	 * @param value The value of the event
	 * @param player The player that triggered the event
	 *
	 * @returns Success
	 */
	async cardUpdate(key, value, player): Promise<boolean> {
		for (const player of [game.player1, game.player2]) {
			for (const card of player.board) {
				// This function gets called directly after a minion is killed.
				if (!card.isAlive()) {
					continue;
				}

				await card.activate("passive", key, value, player);
			}
		}

		for (let i = 0; i < 2; i++) {
			const player = Player.fromID(i);

			// Activate spells in the players hand
			for (const card of player.hand) {
				await card.activate("handpassive", key, value, player);

				if (card.type !== "Spell") {
					continue;
				}

				await card.activate("passive", key, value, player);
			}

			const { weapon } = player;
			if (!weapon) {
				continue;
			}

			await weapon.activate("passive", key, value, player);
		}

		await game.triggerEventListeners(key, value, player);
		return true;
	},

	/**
	 * Update quests and secrets
	 *
	 * @param questsName The type of quest to update
	 * @param key The key of the event
	 * @param value The value of the event
	 * @param player The owner of the quest
	 *
	 * @returns Success
	 */
	async questUpdate(questsName, key, value, player): Promise<boolean> {
		for (const quest of player[questsName]) {
			if (quest.key !== key) {
				continue;
			}

			const [current, max] = quest.progress;

			const done = current + 1 >= max;
			if (!(await quest.callback(value, done))) {
				continue;
			}

			quest.progress[0]++;

			if (!done) {
				continue;
			}

			// The quest/secret is done
			player[questsName].splice(player[questsName].indexOf(quest), 1);

			if (questsName === "secrets") {
				await game.pause(`\nYou triggered the opponents's '${quest.name}'.\n`);
			}

			if (quest.next) {
				const nextQuest = await Card.create(quest.next, player);
				await nextQuest.activate("cast");
			}
		}

		return true;
	},

	/**
	 * Broadcast an event
	 *
	 * @param key The key of the event
	 * @param value The value of the event
	 * @param player The player who caused the event to happen
	 * @param updateHistory Whether or not to update the history
	 *
	 * @returns Success
	 */
	async broadcast(key, value, player, updateHistory = true): Promise<boolean> {
		await this.tick(key, value, player);

		// Check if the event is suppressed
		if (this.suppressed.includes(key) && !this.forced.includes(key)) {
			return false;
		}

		if (updateHistory) {
			// Clone the value if it is a card.
			let historyValue = value;
			if (value instanceof Card) {
				historyValue = value.perfectCopy();
				historyValue.uuid = value.uuid;
			}

			this.addHistory(key, historyValue, player);
		}

		if (player.id === -1) {
			return false;
		}

		if (!this.events[key]) {
			this.events[key] = [[["GameLoop", game.turn]], [["GameLoop", game.turn]]];
		}

		this.events[key]?.[player.id].push([value, game.turn]);

		await this.cardUpdate(key, value, player);

		await this.questUpdate("secrets", key, value, player.getOpponent());
		await this.questUpdate("sidequests", key, value, player);
		await this.questUpdate("quests", key, value, player);

		return true;
	},

	/**
	 * Write an event to history. Done automatically by `broadcast`.
	 *
	 * @param key The key of the event
	 * @param value The value of the event
	 * @param player The player who caused the event to happen
	 */
	addHistory(key, value, player): void {
		if (!this.history[game.turn]) {
			this.history[game.turn] = [["GameLoop", `Init ${key}`, player]];
		}

		this.history[game.turn].push([key, value, player]);
	},

	/**
	 * Broadcast a dummy event. Use if you need to broadcast any event to kickstart an event listener, consider looking into `game.functions.hookToTick`.
	 *
	 * Specifically, this broadcasts the `Dummy` event. DO NOT LISTEN FOR THAT EVENT.
	 *
	 * @param player The player who caused the event to happen
	 *
	 * @returns Success
	 */
	async broadcastDummy(player): Promise<boolean> {
		return this.broadcast("Dummy", undefined, player, false);
	},

	/**
	 * Increment a stat
	 *
	 * @param player The player to update
	 * @param key The key to increment
	 * @param amount The amount to increment by
	 *
	 * @returns The new value
	 */
	increment(player, key, amount = 1): number {
		if (!this.stats[key]) {
			this.stats[key] = [0, 0];
		}

		this.stats[key][player.id] += amount;

		return this.stats[key][player.id];
	},
};
