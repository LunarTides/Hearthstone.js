import { EventKey, EventManagerEvents, EventValue, QuestType, TickHookCallback, UnknownEventValue } from "@Game/types.js";
import { Card, Player } from "../internal.js";

interface IEventManager {
    eventListeners: number;
    tickHooks: TickHookCallback[];
    history: {[x: number]: [[EventKey, UnknownEventValue, Player]]};
    events: EventManagerEvents;
    suppressed: EventKey[];
    stats: {[key: string]: [number, number]};

    tick(key: EventKey, val: UnknownEventValue): boolean;
    cardUpdate(key: EventKey, val: UnknownEventValue): boolean;
    questUpdate(questsName: "secrets" | "sidequests" | "quests", key: EventKey, val: UnknownEventValue, plr: Player): boolean;
    broadcast(key: EventKey, val: UnknownEventValue, plr: Player, updateHistory?: boolean): boolean;
    addHistory(key: EventKey, val: UnknownEventValue, plr: Player): void;
    broadcastDummy(plr: Player): boolean;
    increment(player: Player, key: string, amount?: number): number;
}

export const EventManager: IEventManager = {
    /**
     * The amount of event listeners that have been added to the game, this never decreases.
     */
    eventListeners: 0,

    /**
     * The hooks that will be run when the game ticks.
     */
    tickHooks: [],

    /**
     * The history of the game.
     * 
     * It looks like this: `history[turn] = [[key, val, plr], ...]`
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
     * Some general stats for each player.
     */
    stats: {},

    /**
     * Tick the game
     *
     * @param key The key of the event that triggered the tick
     * @param val The value of the event that triggered the tick
     */
    tick(key, val) {
        // The code in here gets executed very often
        // So don't do any expensive stuff here
        let game = globalThis.game;
        if (!game) return false;

        // Infuse
        if (key === "KillMinion") {
            // TODO: Rewrite and move this code
            val = val as EventValue<typeof key>;
            val.plr.hand.forEach(p => {
                if (!p.infuse || p.infuse <= 0) return;

                p.infuse -= 1;
                if (p.infuse > 0) return;

                p.activate("infuse");
            });
        }

        for (let i = 0; i < 2; i++) {
            let plr = game.functions.getPlayerFromId(i);

            // Activate spells in the players hand
            plr.hand.forEach(card => {
                if (!(card instanceof Card)) throw new Error("Hand contains a non-card");
                if (card.getHealth() <= 0) return;
                
                // Placeholders
                // TODO: Why do we replace placeholders every tick here?
                card.replacePlaceholders();
                card.condition();

                // Just in case. Remove for small performance boost
                card.applyEnchantments();

                card.activate("handtick", key, val);
                if (card.cost < 0) card.cost = 0;
            });

            game.board[i].forEach(card => {
                if (card.type === "Minion" && card.getHealth() <= 0) return;

                card.activate("tick", key, val);
            });
        }

        this.tickHooks.forEach(hook => hook(key, val));
        return true;
    },

    /**
     * Do card passives
     *
     * @param key The key of the event
     * @param val The value of the event
     *
     * @returns Success
     */
    cardUpdate(key, val) {
        let game = globalThis.game;
        if (!game) return false;

        game.board.forEach(p => {
            p.forEach(m => {
                // This function gets called directly after a minion is killed.
                if (m.getHealth() <= 0) return;
                m.activate("passive", key, val);
            });
        });

        for (let i = 0; i < 2; i++) {
            let plr = game.functions.getPlayerFromId(i);

            // Activate spells in the players hand
            plr.hand.forEach(c => {
                c.activate("handpassive", key, val);

                if (c.type != "Spell") return;
                c.activate("passive", key, val);
            });

            let wpn = plr.weapon;
            if (!wpn) continue;
            wpn.activate("passive", key, val);
        }

        game.triggerEventListeners(key, val);
        return true;
    },

    /**
     * Update quests and secrets
     *
     * @param questsName The type of quest to update
     * @param key The key of the event
     * @param val The value of the event
     * @param plr The owner of the quest
     *
     * @returns Success
     */
    questUpdate(questsName, key, val, plr) {
        let game = globalThis.game;
        if (!game) return false;

        plr[questsName].forEach(s => {
            let quest: QuestType = s;

            if (quest.key != key) return;

            let [current, max] = quest.progress;

            let done = current + 1 >= max;
            if (quest.callback(val, done) === false) return;

            quest.progress[0]++;

            if (!done) return;

            // The quest/secret is done
            plr[questsName].splice(plr[questsName].indexOf(quest), 1);

            if (questsName == "secrets") game.input("\nYou triggered the opponents's '" + quest.name + "'.\n");

            if (quest.next) new Card(quest.next, plr).activate("cast");
        });

        return true;
    },

    /**
     * Broadcast an event
     *
     * @param key The key of the event
     * @param val The value of the event
     * @param plr The player who caused the event to happen
     * @param updateHistory Whether or not to update the history
     *
     * @returns Success
     */
    broadcast(key, val, plr, updateHistory = true) {
        let game = globalThis.game;
        if (!game) return false;

        this.tick(key, val);

        if (updateHistory) this.addHistory(key, val, plr);

        // Check if the event is suppressed
        if (this.suppressed.includes(key)) return false;
        if (plr.classType !== "Player" || plr.id === -1) return false;

        if (!this.events[key]) this.events[key] = [[["GameLoop", game.turns]], [["GameLoop", game.turns]]];
        this.events[key]![plr.id].push([val, game.turns]);

        this.cardUpdate(key, val);

        this.questUpdate("secrets",    key, val, plr.getOpponent());
        this.questUpdate("sidequests", key, val, plr);
        this.questUpdate("quests",     key, val, plr);

        return true;
    },

    /**
     * Write an event to history. Done automatically by `broadcast`.
     * 
     * @param key The key of the event
     * @param val The value of the event
     * @param plr The player who caused the event to happen
     */
    addHistory(key, val, plr) {
        let game = globalThis.game;
        if (!game) return;

        if (!this.history[game.turns]) this.history[game.turns] = [["GameLoop", `Init ${key}`, plr]];
        this.history[game.turns].push([key, val, plr]);
    },

    /**
     * Broadcast a dummy event. Use if you need to broadcast any event to kickstart an event listener, consider looking into `game.functions.hookToTick`.
     * 
     * Specifically, this broadcasts the `Dummy` event. DO NOT LISTEN FOR THAT EVENT.
     * 
     * @param plr The player who caused the event to happen
     * 
     * @returns Success
     */
    broadcastDummy(plr) {
        return this.broadcast("Dummy", null, plr, false);
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
    increment(player, key, amount = 1) {
        if (!this.stats[key]) this.stats[key] = [0, 0];

        this.stats[key][player.id] += amount;

        return this.stats[key][player.id];
    }
}
