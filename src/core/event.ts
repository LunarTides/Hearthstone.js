import { Card } from "@Core/card.js";
import { Player } from "@Core/player.js";
import type {
	EventKey,
	EventListenerCallback,
	EventManagerEvents,
	HistoryKey,
	TickHookCallback,
	UnknownEventValue,
} from "@Game/types.js";

export const eventManager = {
	/**
	 * The event listeners that are attached to the game currently.
	 */
	listeners: {} as Record<
		number,
		(key: EventKey, value: UnknownEventValue, player: Player) => Promise<void>
	>,

	/**
	 * The amount of event listeners that have been added to the game, this never decreases.
	 */
	listenerCount: 0,

	/**
	 * The hooks that will be run when the game ticks.
	 */
	tickHooks: [] as TickHookCallback[],

	/**
	 * The history of the game.
	 *
	 * It looks like this: `history[turn] = [[key, val, player], ...]`
	 */
	history: {} as Record<number, HistoryKey[]>,

	/**
	 * Used like this:
	 * ```ts
	 * events[key] = {player1id: [[val1, turn], [val2, turn], [val3, turn], ...], player2id: [...]};
	 * ```
	 */
	events: {} as EventManagerEvents,

	/**
	 * A list of event keys to suppress.
	 *
	 * If an event with a key in this list is broadcast, it will add it to the history, and tick the game, but will not activate any passives / event listeners.
	 */
	suppressed: [] as EventKey[],

	/**
	 * A list of event keys to never suppress.
	 */
	forced: [] as EventKey[],

	/**
	 * Some general stats for each player.
	 */
	stats: {} as Record<string, [number, number]>,

	/**
	 * Tick the game
	 *
	 * @param key The key of the event that triggered the tick
	 * @param value The value of the event that triggered the tick
	 * @param player The player that triggered the tick
	 */
	async tick(
		key: EventKey,
		value: UnknownEventValue,
		player: Player,
	): Promise<boolean> {
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
	async cardUpdate(
		key: EventKey,
		value: UnknownEventValue,
		player: Player,
	): Promise<boolean> {
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
	async questUpdate(
		questsName: "quests" | "sidequests" | "secrets",
		key: EventKey,
		value: UnknownEventValue,
		player: Player,
	): Promise<boolean> {
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
	async broadcast(
		key: EventKey,
		value: UnknownEventValue,
		player: Player,
		updateHistory = true,
	): Promise<boolean> {
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
	addHistory(key: EventKey, value: UnknownEventValue, player: Player): void {
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
	async broadcastDummy(player: Player): Promise<boolean> {
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
	increment(player: Player, key: string, amount = 1): number {
		if (!this.stats[key]) {
			this.stats[key] = [0, 0];
		}

		this.stats[key][player.id] += amount;

		return this.stats[key][player.id];
	},

	/**
	 * Add an event listener.
	 *
	 * @param key The event to listen for. If this is an empty string, it will listen for any event.
	 * @param callback The code that will be ran if the event listener gets triggered.
	 * @param lifespan How many times the event listener will trigger and call "callback" before self-destructing. Set this to -1 to make it last forever, or until it is manually destroyed using "callback".
	 *
	 * @returns If you call this function, it will destroy the event listener.
	 */
	addListener(
		key: EventKey | "",
		callback: EventListenerCallback,
		lifespan = 1,
	): () => boolean {
		let times = 0;

		const id = this.listenerCount;
		let alive = true;

		/**
		 * Destroys the eventlistener and removes it from the game event listeners.
		 *
		 * @returns Returns true if the object was successfully destroyed, false otherwise.
		 */
		const destroy = () => {
			if (!alive) {
				return false;
			}

			delete this.listeners[id];

			alive = false;
			return true;
		};

		this.listeners[id] = async (
			_key: EventKey,
			_unknownValue: UnknownEventValue,
			eventPlayer: Player,
		) => {
			// Validate key. If key is empty, match any key.
			if (key !== "" && _key !== key) {
				return;
			}

			const message = await callback(_unknownValue, eventPlayer);
			times++;

			switch (message) {
				case "destroy": {
					destroy();
					break;
				}

				case "reset": {
					times = 0;
					break;
				}

				case false: {
					times--;
					break;
				}

				case true: {
					break;
				}

				default: {
					break;
				}
			}

			if (times === lifespan) {
				destroy();
			}
		};

		this.listenerCount++;

		return destroy;
	},

	/**
	 * Hooks a callback function to the tick event.
	 *
	 * @param callback The callback function to be hooked.
	 *
	 * @returns A function that, when called, will remove the hook from the tick event.
	 */
	hookToTick(callback: TickHookCallback): () => void {
		this.tickHooks.push(callback);

		const unhook = () => {
			game.functions.util.remove(this.tickHooks, callback);
		};

		return unhook;
	},

	/**
	 * Suppresses the specified event key by adding it to the list of suppressed events.
	 *
	 * @param key The event key to be suppressed.
	 *
	 * @returns A function that undoes the suppression.
	 */
	suppress(key: EventKey): () => boolean {
		this.suppressed.push(key);

		/**
		 * Unsuppresses the event key.
		 */
		const unsuppress = () => game.functions.util.remove(this.suppressed, key);

		return unsuppress;
	},

	/**
	 * Ignores suppression for the specified event key.
	 *
	 * @param key The event key to be forced.
	 *
	 * @returns A function that undoes this.
	 */
	ignoreSuppression(key: EventKey): () => boolean {
		this.forced.push(key);

		/**
		 * Stops ignoring suppressions for that key
		 */
		const undo = () => game.functions.util.remove(this.suppressed, key);

		return undo;
	},

	/**
	 * Executes the given callback while suppressing the specified key or keys.
	 *
	 * @param key The key or keys to suppress.
	 * @param callback The callback to execute.
	 *
	 * @returns The return value of the callback.
	 */
	async withSuppressed<T>(
		key: EventKey | EventKey[],
		callback: () => Promise<T>,
	): Promise<T> {
		const unsuppressed: Array<() => boolean> = [];

		if (Array.isArray(key)) {
			for (const _key of key) {
				unsuppressed.push(this.suppress(_key));
			}
		} else {
			unsuppressed.push(this.suppress(key));
		}

		const returnValue = await callback();
		for (const unsuppress of unsuppressed) {
			unsuppress();
		}

		return returnValue;
	},
};
