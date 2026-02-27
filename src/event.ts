import { Card } from "@Game/card.ts";
import { Player } from "@Game/player.ts";
import {
	Ability,
	Alignment,
	Event,
	type EventListenerCallback,
	EventListenerMessage,
	type EventManagerEvents,
	type EventValue,
	type HistoryKey,
	type QuestObject,
	QuestType,
	TargetType,
	type TickHookCallback,
	Type,
} from "@Game/types.ts";

/**
 * For each event here, it will show the return value of the function in the history command.
 *
 * The `handle` function should be called when dealing with the value. Don't change the `hide` parameter unless you have a good reason to.
 */
export const readableHistory: {
	[E in Event]: (
		plr: Player,
		value: EventValue<E>,
		handle: (value: unknown, hide?: boolean) => Promise<string>,
	) => Promise<string>;
} = {
	[Event.FatalDamage]: async (plr, value, handle) =>
		`${await handle(plr)} was dealt fatal damage`,

	[Event.EndTurn]: async (plr, value, handle) =>
		`${await handle(plr)} ended their turn`,

	[Event.StartTurn]: async (plr, value, handle) =>
		`${await handle(plr)} started their turn`,

	[Event.HealthRestored]: async (plr, value, handle) =>
		`${await handle(plr)} restored to <b>${await handle(value)}</b> health`,

	[Event.UnspentMana]: async (plr, value, handle) =>
		`${await handle(plr)} ended their turn with <b>${await handle(value)}</b> unspent mana`,

	[Event.GainOverload]: async (plr, value, handle) =>
		`${await handle(plr)} gained <b>${await handle(value)}</b> overload`,

	[Event.GainHeroAttack]: async (plr, value, handle) =>
		`${await handle(plr)} gained <b>${await handle(value)}</b> attack`,

	[Event.TakeDamage]: async (plr, value, handle) =>
		`${await handle(plr)} took <b>${await handle(value)}</b> damage`,

	[Event.PlayCard]: async (plr, value, handle) =>
		`${await handle(plr)} played ${await handle(value)}`,

	[Event.PlayCardUnsafe]: async (plr, value, handle) =>
		`${await handle(plr)} is trying to play a ${await handle(value)}`,

	[Event.SummonCard]: async (plr, value, handle) =>
		`${await handle(plr)} summoned a ${await handle(value)}`,

	[Event.DestroyCard]: async (plr, value, handle) =>
		`${await handle(value)} was destroyed`,

	[Event.DamageCard]: async (plr, [card, amount], handle) =>
		`${await handle(card)} was dealt <b>${await handle(amount)}</b> damage`,

	[Event.SilenceCard]: async (plr, value, handle) =>
		`${await handle(value)} was silenced`,

	[Event.DiscardCard]: async (plr, value, handle) =>
		`${await handle(value)} was discarded`,

	[Event.CancelCard]: async (plr, [card, ability], handle) =>
		`${await handle(card)}'s <b>${await handle(ability)}</b> was cancelled`,

	[Event.TradeCard]: async (plr, value, handle) =>
		`${await handle(value)} was traded`,

	[Event.ForgeCard]: async (plr, value, handle) =>
		`${await handle(value)} was forged`,

	[Event.FreezeCard]: async (plr, value, handle) =>
		`${await handle(value)} was frozen`,

	[Event.CreateCard]: async (plr, value, handle) =>
		`${await handle(value)} was created`,

	[Event.RevealCard]: async (plr, [card, reason], handle) =>
		`${await handle(card)} was revealed due to ${reason}`,

	[Event.BurnCard]: async (plr, value, handle) =>
		`${await handle(value)} was burned due to a lack of hand space`,

	[Event.Titan]: async (plr, [titan, ability], handle) =>
		`${await handle(titan)}'s titan ability (${await handle(ability)}) was triggered`,

	[Event.AddCardToDeck]: async (plr, value, handle) =>
		`${await handle(value)} was added to ${await handle(plr)}'s deck`,

	[Event.AddCardToHand]: async (plr, value, handle) =>
		`${await handle(value)} was added to ${await handle(plr)}'s hand`,

	[Event.DrawCard]: async (plr, value, handle) =>
		`${await handle(plr)} drew ${await handle(value)}`,

	[Event.ChangeLocation]: async (plr, [card, location], handle) =>
		`${await handle(card)}'s location was changed to <b>${await handle(location)}</b>`,

	[Event.ChangeHero]: async (plr, [oldHero, newHero], handle) =>
		`${await handle(plr)}'s hero has become ${await handle(newHero)}`,

	[Event.SpellDealsDamage]: async (plr, [target, amount], handle) =>
		`${await handle(target)} dealt <b>${amount}</b> damage`,

	[Event.Attack]: async (plr, [attacker, target, flags], handle) =>
		`${await handle(attacker)} attacked ${await handle(target)}`,

	[Event.HeroPower]: async (plr, value, handle) =>
		`${await handle(plr)} used their hero power`,

	[Event.TargetSelectionStarts]: async (plr, [prompt, host, flags], handle) =>
		`${await handle(plr)} started selecting a target. [Prompt: "${prompt}", Host: ${host ? await handle(host) : "Game"}, Type: ${flags.targetType === undefined ? "All" : TargetType[flags.targetType]}, Alignment: ${flags.alignment === undefined ? "All" : Alignment[flags.alignment]}]`,

	[Event.TargetSelected]: async (plr, [host, target], handle) =>
		`${await handle(plr)} selected ${await handle(target)} [Host: ${host ? await handle(host) : "Game"}]`,

	[Event.CardEvent]: async (plr, [card, event], handle) =>
		`${await handle(card)} said: ${event}`,

	[Event.Dummy]: async (plr, value, handle) => `Dummy Event (Test)`,

	[Event.Eval]: async (plr, value, handle) =>
		`${await handle(plr)} eval'd: ${await handle(value)}`,

	[Event.Input]: async (plr, value, handle) =>
		`${await handle(plr)} typed: ${await handle(value)}`,
};

export const eventManager = {
	/**
	 * The event listeners that are attached to the game currently.
	 */
	listeners: {} as Record<
		number,
		(key: any, value: any, player: Player) => Promise<void>
	>,

	/**
	 * The amount of event listeners that have been added to the game, this never decreases.
	 */
	listenerCount: 0,

	/**
	 * The hooks that will be run when the game ticks.
	 */
	tickHooks: [] as TickHookCallback<Event>[],

	/**
	 * The history of the game.
	 *
	 * It looks like this: `history[turn] = [[key, val, player], ...]`
	 */
	history: {} as Record<number, HistoryKey<Event>[]>,

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
	suppressed: [] as Event[],

	/**
	 * A list of event keys to never suppress.
	 */
	forced: [] as Event[],

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
	async tick<E extends Event>(
		key: E,
		value: EventValue<E>,
		player: Player,
	): Promise<boolean> {
		/*
		 * The code in here gets executed very often
		 * So don't do any expensive stuff here
		 */

		// Infuse
		if (key === Event.DestroyCard) {
			for (const card of player.hand) {
				await card.tryInfuse();
			}
		}

		for (let i = 0; i < 2; i++) {
			const player = Player.fromID(i);

			for (const card of player.hand) {
				if (!card.backups.init) {
					throw new Error(
						`Card is not initialized: ${card.name}. Use Card.create instead of new Card.`,
					);
				}

				await card.condition();

				// Some enchantments may be dependant on the game state, and so need to be refreshed.
				await card.refreshEnchantments();

				await card.trigger(Ability.HandTick, key, value, player);
				if (card.cost < 0) {
					card.cost = 0;
				}
			}

			for (const card of player.board) {
				if (card.type === Type.Minion && !card.isAlive()) {
					continue;
				}

				await card.trigger(Ability.Tick, key, value, player);
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
	async cardUpdate<E extends Event>(
		key: E,
		value: EventValue<E>,
		player: Player,
	): Promise<boolean> {
		for (const player of [game.player1, game.player2]) {
			for (const card of player.board) {
				// This function gets called directly after a minion is killed.
				if (!card.isAlive()) {
					continue;
				}

				await card.trigger(Ability.Passive, key, value, player);
			}
		}

		for (let i = 0; i < 2; i++) {
			const pI = Player.fromID(i);

			// Activate spells in the players hand
			for (const card of pI.hand) {
				await card.trigger(Ability.HandPassive, key, value, player);

				if (card.type !== Type.Spell) {
					continue;
				}

				await card.trigger(Ability.Passive, key, value, player);
			}

			// Trigger the hero's passive ability.
			// NOTE: The hero *can* be uninitialized very early on.
			if (pI.hero) {
				await pI.hero.trigger(Ability.Passive, key, value, player);
			}

			// Trigger the weapon's passive ability.
			const weapon = pI.weapon;
			if (!weapon) {
				continue;
			}

			await weapon.trigger(Ability.Passive, key, value, player);
		}

		// Trigger event listeners.
		for (const eventListener of Object.values(game.event.listeners)) {
			await eventListener(key, value, player);
		}

		return true;
	},

	/**
	 * Update quests and secrets.
	 *
	 * @param questType The type of quest to update
	 * @param key The key of the event
	 * @param value The value of the event
	 * @param player The owner of the quest
	 *
	 * @returns Success
	 */
	async questUpdate<E extends Event>(
		questType: QuestType,
		key: E,
		value: EventValue<E>,
		player: Player,
	): Promise<boolean> {
		const removeQuest = async (quest: QuestObject<Event>) => {
			game.functions.util.remove(player.quests, quest);

			if (quest.type === QuestType.Secret) {
				console.log();
				await game.pause(
					`You triggered the opponents's '${quest.card.name}'.\n`,
				);
			}

			if (quest.next) {
				const nextQuest = await Card.create(quest.next, player);
				await nextQuest.trigger(Ability.Cast);
			}
		};

		for (const quest of player.quests) {
			if (quest.key !== key || quest.type !== questType) {
				continue;
			}

			const [current, max] = quest.progress;
			if (current === max) {
				await removeQuest(quest);
				continue;
			}

			const done = current + 1 >= max;
			const message = await quest.callback(value, done);

			switch (message) {
				case EventListenerMessage.Skip:
					continue;
				case EventListenerMessage.Reset:
					quest.progress = [0, max];
					continue;
				case EventListenerMessage.Destroy:
					game.functions.util.remove(player.quests, quest);
					continue;
				case EventListenerMessage.Success:
					break;
			}

			quest.progress[0]++;

			if (!done) {
				continue;
			}

			// The quest/secret is done
			await removeQuest(quest);
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
	async broadcast<E extends Event>(
		key: E,
		value: EventValue<E>,
		player: Player,
		updateHistory = true,
	): Promise<boolean> {
		await this.tick(key, value, player);

		// Check if the event is suppressed
		if (this.suppressed.includes(key) && !this.forced.includes(key)) {
			return false;
		}

		if (updateHistory) {
			if (value instanceof Card) {
				// Clone the value if it is a card.
				const card = value.perfectCopy();
				card.uuid = value.uuid;
				this.addHistory(key, card as EventValue<E>, player);
			} else {
				this.addHistory(key, value, player);
			}
		}

		if (player.id === -1) {
			return false;
		}

		if (!this.events[key]) {
			// This fixes #422
			this.events[key] = [[[null, 0]], [[null, 0]]];
		}

		this.events[key]?.[player.id].push([value as any, game.turn]);

		await this.cardUpdate(key, value, player);

		await this.questUpdate(QuestType.Secret, key, value, player.getOpponent());
		await this.questUpdate(QuestType.Sidequest, key, value, player);
		await this.questUpdate(QuestType.Quest, key, value, player);

		return true;
	},

	/**
	 * Write an event to history. Done automatically by `broadcast`.
	 *
	 * @param key The key of the event
	 * @param value The value of the event
	 * @param player The player who caused the event to happen
	 */
	addHistory<E extends Event>(
		key: E,
		value: EventValue<E>,
		player: Player,
	): void {
		if (!this.history[game.turn]) {
			this.history[game.turn] = [];
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
		return this.broadcast(Event.Dummy, undefined, player, false);
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
	addListener<E extends Event>(
		key: E | "",
		callback: EventListenerCallback<E>,
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
			_key: E,
			value: EventValue<E>,
			eventPlayer: Player,
		) => {
			// Validate key. If key is empty, match any key.
			if (key !== "" && _key !== key) {
				return;
			}

			const message = await callback(value, eventPlayer);
			times++;

			switch (message) {
				case EventListenerMessage.Destroy: {
					destroy();
					break;
				}

				case EventListenerMessage.Reset: {
					times = 0;
					break;
				}

				case EventListenerMessage.Skip: {
					times--;
					break;
				}

				case EventListenerMessage.Success: {
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
	hookToTick<E extends Event>(callback: TickHookCallback<E>): () => void {
		(this.tickHooks as TickHookCallback<E>[]).push(callback);

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
	suppress(key: Event): () => boolean {
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
	ignoreSuppression(key: Event): () => boolean {
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
		key: Event | Event[],
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

	/**
	 * Checks if the given `key` matches the given `expected` Event.
	 *
	 * @param key The key to check.
	 * @param value The value to narrow.
	 * @param expected The expected Event.
	 */
	is<E extends Event>(
		key: Event | undefined,
		value: unknown,
		expected: E,
	): value is EventValue<E> {
		return key === expected;
	},
};
