/**
 * Game
 * @module Game
 */
import { question }  from 'readline-sync';
import { functions, interact, Player, Card, AI } from "../internal.js";
import { Blueprint, EventKey, EventManagerEvents, EventValue, GameAttackReturn, GameConfig, GameConstants, GamePlayCardReturn, QuestType, Target, TickHookCallback, UnknownEventValue } from "../types.js";

// Override the console methods to force using the wrapper functions
// Set this variable to false to prevent disabling the console. (Not recommended)
let disableConsole = true;

let overrideConsole = {log: () => {}, warn: () => {}, error: () => {}};
overrideConsole.log = console.log;
overrideConsole.warn = console.warn;
overrideConsole.error = console.error;

if (disableConsole) {
    console.log = (..._) => {
        throw new Error("Use `game.log` instead.")
    };
    console.warn = (..._) => {
        throw new Error("Use `game.logWarn` instead.")
    };
    console.error = (..._) => {
        throw new Error("Use `game.logError` instead.")
    };
}

interface IEventManager {
    eventListeners: number;
    tickHooks: TickHookCallback[];
    history: {[x: number]: [[EventKey, UnknownEventValue, Player]]};
    events: EventManagerEvents;
    suppressed: EventKey[];
    stats: {[key: string]: [number, number]};

    tick(key: EventKey, val: UnknownEventValue): boolean;
    cardUpdate(key: EventKey, val: UnknownEventValue): boolean;
    questUpdate(quests_name: "secrets" | "sidequests" | "quests", key: EventKey, val: UnknownEventValue, plr: Player): boolean;
    broadcast(key: EventKey, val: UnknownEventValue, plr: Player, updateHistory?: boolean): boolean;
    addHistory(key: EventKey, val: UnknownEventValue, plr: Player): void;
    broadcastDummy(plr: Player): boolean;
    increment(player: Player, key: string, amount?: number): number;
}

const eventManager: IEventManager = {
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
            let plr = functions.getPlayerFromId(i);

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

        eventManager.tickHooks.forEach(hook => hook(key, val));
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
                if (m.getHealth() <= 0) return; // This function gets called directly after a minion is killed.
                m.activate("passive", key, val);
            });
        });

        for (let i = 0; i < 2; i++) {
            let plr = functions.getPlayerFromId(i);

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
     * @param quests_name The type of quest to update
     * @param key The key of the event
     * @param val The value of the event
     * @param plr The owner of the quest
     *
     * @returns Success
     */
    questUpdate(quests_name, key, val, plr) {
        let game = globalThis.game;
        if (!game) return false;

        plr[quests_name].forEach(s => {
            let quest: QuestType = s;

            if (quest.key != key) return;

            let [current, max] = quest.progress;

            let done = current + 1 >= max;
            if (quest.callback(val, done) === false) return;

            quest.progress[0]++;

            if (!done) return;

            // The quest/secret is done
            plr[quests_name].splice(plr[quests_name].indexOf(quest), 1);

            if (quests_name == "secrets") game.input("\nYou triggered the opponents's '" + quest.name + "'.\n");

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

        eventManager.tick(key, val);

        if (updateHistory) eventManager.addHistory(key, val, plr);

        // Check if the event is suppressed
        if (eventManager.suppressed.includes(key)) return false;
        if (plr.classType !== "Player" || plr.id === -1) return false;

        if (!eventManager.events[key]) eventManager.events[key] = [[["GameLoop", game.turns]], [["GameLoop", game.turns]]];
        eventManager.events[key]![plr.id].push([val, game.turns]);

        eventManager.cardUpdate(key, val);

        eventManager.questUpdate("secrets",    key, val, plr.getOpponent());
        eventManager.questUpdate("sidequests", key, val, plr);
        eventManager.questUpdate("quests",     key, val, plr);

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

        if (!eventManager.history[game.turns]) eventManager.history[game.turns] = [["GameLoop", `Init ${key}`, plr]];
        eventManager.history[game.turns].push([key, val, plr]);
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
        return eventManager.broadcast("Dummy", null, plr, false);
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
        if (!eventManager.stats[key]) eventManager.stats[key] = [0, 0];

        eventManager.stats[key][player.id] += amount;

        return eventManager.stats[key][player.id];
    }
}

export class Game {
    /**
     * Some general functions that can be used.
     * 
     * This has a lot of abstraction, so don't be afraid to use them.
     * Look in here for more.
     */
    functions = functions;

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
     * Events & History managment and tracker.
     */
    events = eventManager;

    /**
     * This has a lot of functions for interacting with the user.
     * 
     * This is generally less useful than the `functions` object, since the majority of these functions are only used once in the source code.
     * However, some functions are still useful. For example, the `selectTarget` function.
     */
    interact = interact;

    /**
     * Some configuration for the game.
     * 
     * Look in the `config` folder.
     */
    config: GameConfig;

    /**
     * All of the cards that have been implemented so far.
     * 
     * Use `functions.getCards()` instead.
     */
    cards: Blueprint[] = [];

    playCard = cards.play.play;
    summonMinion = cards.summon;

    attack = attack.attack;

    Card = Card;

    /**
     * The turn counter.
     * 
     * This goes up at the beginning of each player's turn.
     * 
     * This means that, for example, if `Player 1`'s turn is on turn 0, then when it's `Player 1`'s turn again, the turn counter is 2.
     * 
     * Do
     * ```
     * Math.ceil(game.turns / 2)
     * ```
     * for a more conventional turn counter.
     */
    turns: number = 0;

    /**
     * The board of the game.
     * 
     * The 0th element is `game.player1`'s side of the board,
     * and the 1th element is `game.player2`'s side of the board.
     */
    board: Card[][] = [[], []];

    /**
     * The graveyard, a list of cards that have been killed.
     * 
     * The 0th element is `game.player1`'s graveyard,
     * and the 1st element is `game.player2`'s graveyard.
     */
    graveyard: Card[][] = [[], []];

    /**
     * The event listeners that are attached to the game currently.
     */
    eventListeners: {[key: number]: (key: EventKey, val: UnknownEventValue) => void} = {};

    /**
     * Whether or not the game is currently accepting input from the user.
     * 
     * If this is true, the user can't interact with the game. This will most likely cause an infinite loop, unless both players are ai's.
     */
    no_input: boolean = false;

    /**
     * If the game is currently running.
     * 
     * If this is false, the game loop will end.
     */
    running: boolean = true;

    /**
     * If the program is currently evaluating code. Should only be enabled while running a `eval` function.
     * 
     * This is used to throw errors in places that normally would just return null / "invalid".
     */
    evaling: boolean = false;

    /**
     * Some constant values.
     */
    constants: GameConstants;

    constructor() {
        globalThis.game = this;
    }
    
    /**
     * Sets up the game by assigning players and initializing game state.
     *
     * @param player1 The first player.
     * @param player2 The second player.
     */
    setup(player1: Player, player2: Player) {
        // Choose a random player to be player 1
        this.player1 = player1; // Set this to player 1 temporarily, in order to never be null
        this.player2 = player2;

        // Choose a random player to be player 1 and player 2
        if (functions.randInt(0, 1)) {
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

        // Some constants
        this.constants = {
            REFUND: -1
        };

        globalThis.game = this;
    }

    /**
     * Ask the user a question and returns their answer
     *
     * @param q The question to ask
     * @param care If this is false, it overrides `game.no_input`. Only use this when debugging.
     *
     * @returns What the user answered
     */
    input(q: string = "", care: boolean = true): string {
        const wrapper = (a: string) => {
            if (this.player instanceof Player) this.events.broadcast("Input", a, this.player);
            return a;
        }

        if (this.no_input && care) return wrapper("");

        q = functions.parseTags(q);

        // Let the game make choices for the user
        if (this.player.inputQueue) {
            let queue = this.player.inputQueue;

            if (typeof(queue) == "string") return wrapper(queue);
            else if (!(queue instanceof Array)) return wrapper(question(q)); // Invalid queue

            const answer = queue[0];
            functions.remove(queue, answer);

            if (queue.length <= 0) this.player.inputQueue = undefined;

            return wrapper(answer);
        }

        return wrapper(question(q));
    }

    private logWrapper(callback: Function, ...data: any) {
        data = data.map((i: any) => typeof i === "string" ? functions.parseTags(i) : i);
        callback(...data);
    }

    /**
     * Wrapper for console.log 
     */
    log(...data: any) {
        this.logWrapper(overrideConsole.log, ...data);
    }

    /**
     * Wrapper for console.error
     */
    logError(...data: any) {
        this.logWrapper(overrideConsole.error, ...data);
    }

    /**
     * Wrapper for console.warn
     */
    logWarn(...data: any) {
        this.logWrapper(overrideConsole.warn, ...data);
    }

    /**
     * Assigns an ai to the players if in the config.
     * 
     * Unassigns the player's ai's if not in the config.
     *
     * @returns Success
     */
    doConfigAI(): boolean {
        if (this.config.ai.player1) {
            if (!this.player1.ai) this.player1.ai = new AI(this.player1);
        }
        else this.player1.ai = undefined;

        if (this.config.ai.player2) {
            if (!this.player2.ai) this.player2.ai = new AI(this.player2);
        }
        else this.player2.ai = undefined;

        return true;
    }

    /**
     * Broadcast event to event listeners
     * 
     * @param key The name of the event (see `EventKey`)
     * @param val The value of the event
     * 
     * @returns Return values of all the executed functions
     */
    triggerEventListeners(key: EventKey, val: UnknownEventValue): any[] {
        let ret: any[] = [];
        Object.values(this.eventListeners).forEach(i => ret.push(i(key, val)));
        return ret;
    }

    // Start / End

    /**
     * Starts the game
     * 
     * @returns Success
     */
    startGame(): boolean {
        let players = [];

        // Add quest cards to the players hands
        for (let i = 0; i < 2; i++) {
            // Set the player's hero to the default hero for the class
            let plr = functions.getPlayerFromId(i);
            
            let success = plr.setToStartingHero();
            if (!success) {
                game.log("File 'cards/StartingHeroes/" + plr.heroClass.toLowerCase().replaceAll(" ", "_") + ".mts' is either; Missing or Incorrect. Please copy the working 'cards/StartingHeroes/' folder from the github repo to restore a working copy. Error Code: 12");
                process.exit(1);
            }

            plr.deck.forEach(c => {
                if (!c.desc?.includes("Quest: ") && !c.desc?.includes("Questline: ")) return;

                let unsuppress = functions.suppressEvent("AddCardToHand");
                plr.addToHand(c);
                unsuppress();

                plr.deck.splice(plr.deck.indexOf(c), 1);
            });

            let nCards = (plr.id == 0) ? 3 : 4;
            while (plr.hand.length < nCards) {
                let unsuppress = functions.suppressEvent("DrawCard");
                plr.drawCard();
                unsuppress();
            }

            plr.deck.forEach(c => c.activate("startofgame"));
            plr.hand.forEach(c => c.activate("startofgame"));

            players.push(plr);
        }

        this.player1 = players[0];
        this.player2 = players[1];

        this.player1.maxMana = 1;
        this.player1.mana = 1;

        let the_coin = new Card("The Coin", this.player2);

        let unsuppress = functions.suppressEvent("AddCardToHand");
        this.player2.addToHand(the_coin);
        unsuppress();

        this.turns += 1;

        return true;
    }

    /**
     * Ends the game and declares `winner` as the winner
     * 
     * @param winner The winner
     * 
     * @returns Success
     */
    endGame(winner: Player): boolean {
        if (!winner) return false;

        this.interact.printName();

        this.input(`Player ${winner.name} wins!\n`);

        this.running = false;

        // Create log file
        functions.createLogFile();

        return true;
    }

    /**
     * Ends the players turn and starts the opponents turn
     * 
     * @returns Success
     */
    endTurn(): boolean {
        // Kill all minions with 0 or less health
        this.killMinions();

        // Update events
        this.events.broadcast("EndTurn", this.turns, this.player);

        let plr = this.player;
        let op = this.opponent;

        this.board[plr.id].forEach(m => {
            m.ready();
        });

        // Trigger unspent mana
        if (plr.mana > 0) this.events.broadcast("UnspentMana", plr.mana, plr);

        // Remove echo cards
        plr.hand = plr.hand.filter(c => !c.echo);
        plr.canAttack = true;

        // Turn starts
        this.turns++;
        
        // Mana stuff
        op.gainEmptyMana(1);
        op.mana = op.maxMana - op.overload;
        op.overload = 0;
        op.attack = 0;

        // Weapon stuff
        if (op.weapon) {
            if (op.weapon.getAttack() > 0) {
                op.attack = op.weapon.getAttack();
                op.weapon.resetAttackTimes();
            }
        }

        // Minion start of turn
        this.board[op.id].forEach(m => {
            // Dormant
            if (m.dormant) {
                if (this.turns > m.dormant) {
                    m.dormant = undefined;
                    m.sleepy = true;

                    m.immune = m.backups.init.immune;
                    m.turn = this.turns;

                    // If the battlecry use a function that depends on `game.player`
                    this.player = op;
                    m.activateBattlecry();
                    this.player = plr;
                }

                return;
            }

            m.canAttackHero = true;
            if (this.turns > (m.turnFrozen ?? -1) + 1) m.frozen = false;
            m.ready();

            // Stealth duration
            if (m.stealthDuration && m.stealthDuration > 0 && this.turns > m.stealthDuration) {
                m.stealthDuration = 0;
                m.removeKeyword("Stealth");
            }

            // Location cooldown
            if (m.type == "Location" && m.cooldown && m.cooldown > 0) m.cooldown--;
        });

        // Draw card
        op.drawCard();

        op.canUseHeroPower = true;

        this.events.broadcast("StartTurn", this.turns, op);

        this.player = op;
        this.opponent = plr;

        return true;
    }

    // Interacting with minions

    /**
     * Kill all minions with 0 or less health
     * 
     * @returns The amount of minions killed
     */
    killMinions(): number {
        let amount = 0;

        for (let p = 0; p < 2; p++) {
            let plr = functions.getPlayerFromId(p);

            let sparedMinions: Card[] = [];
            let shouldSpare = (card: Card) => {
                return card.getHealth() > 0 || ((card.durability ?? 0) > 0);
            }
            
            this.board[p].forEach(m => {
                if (shouldSpare(m)) return;

                m.activate("deathrattle");
            });

            this.board[p].forEach(m => {
                // Add minions with more than 0 health to n.
                if (shouldSpare(m)) {
                    sparedMinions.push(m);
                    return;
                }

                // Calmly tell the minion that it is going to die
                m.activate("remove");
                this.events.broadcast("KillMinion", m, this.player);

                m.turnKilled = this.turns;
                amount++;

                plr.corpses++;
                this.graveyard[p].push(m);

                if (!m.keywords.includes("Reborn")) return;

                // Reborn
                let minion = m.imperfectCopy();

                minion.removeKeyword("Reborn");

                // Reduce the minion's health to 1, keep the minion's attack the same
                minion.setStats(minion.getAttack(), 1);

                let unsuppress = functions.suppressEvent("SummonMinion");
                this.summonMinion(minion, plr);
                unsuppress();

                // Activate the minion's passive
                // We're doing this because otherwise, the passive won't be activated this turn
                // Normally when we summon a minion, it will be activated immediately, since the `PlayCard` event gets triggered immediately after playing the card
                // but this is not the case here, since we are directly summoning the minion, and we told it to not broadcast the event.
                // The `reborn` string is passed in order for the card to know why the passive was triggered. The card can explicitly look for the `reborn` string
                // in its passive.
                // So it looks like this:
                // minion.activate(key, reason, minion);
                minion.activate("passive", "reborn", m);

                sparedMinions.push(minion);
            });

            this.board[p] = sparedMinions;
        }

        return amount;
    }
}

export function createGame() {
    const game = new Game();
    const player1 = new Player("Player 1");
    const player2 = new Player("Player 2");
    game.setup(player1, player2);
    functions.importCards(functions.dirname() + "cards");
    functions.importConfig();

    return { game, player1, player2 };
}

const attack = {
    /**
     * Makes a minion or hero attack another minion or hero
     * 
     * @param attacker attacker | Amount of damage to deal
     * @param target The target
     * 
     * @returns Success | Errorcode
     */
    attack(attacker: Target | number | string, target: Target): GameAttackReturn {
        if (!attacker || !target) {
            if (game.evaling) throw new TypeError("Evaling Error - The `attacker` or `target` argument passed to `attack` are invalid. Make sure you passed in both arguments.");
            return "invalid";
        }

        game.killMinions();

        if (target.immune) return "immune";

        // Attacker is a number
        if (typeof attacker === "string" || typeof attacker === "number") return attack._attackerIsNum(attacker, target);

        // The attacker is a card or player
        if (attacker.frozen) return "frozen";

        // Check if there is a minion with taunt
        let taunts = game.board[game.opponent.id].filter(m => m.keywords.includes("Taunt"));
        if (taunts.length > 0) {
            // If the target is a card and has taunt, you are allowed to attack it
            if (target instanceof Card && target.keywords.includes("Taunt")) {}
            else return "taunt";
        }

        // Attacker is a player
        if (attacker.classType === "Player") return attack._attackerIsPlayer(attacker, target);

        // Attacker is a minion
        else if (attacker.classType === "Card") return attack._attackerIsCard(attacker, target);

        // Otherwise
        else return "invalid";
    },

    // Attacker is a number
    _attackerIsNum(attacker: number | string, target: Target): GameAttackReturn {
        // Attacker is a number
        // Spell damage
        let dmg = attack._spellDamage(attacker, target);

        if (target.classType == "Player") {
            target.remHealth(dmg);
            return true;
        }

        if (target.keywords.includes("Divine Shield")) {
            target.removeKeyword("Divine Shield");
            return "divineshield";
        }

        target.remStats(0, dmg)

        // Remove frenzy
        attack._doFrenzy(target);

        return true;
    },

    // Attacker is a player
    _attackerIsPlayer(attacker: Player, target: Target): GameAttackReturn {
        if (attacker.attack <= 0) return "plrnoattack";
        if (!attacker.canAttack) return "plrhasattacked";

        // Target is a player
        if (target.classType == "Player") return attack._attackerIsPlayerAndTargetIsPlayer(attacker, target);

        // Target is a card
        else if (target.classType == "Card") return attack._attackerIsPlayerAndTargetIsCard(attacker, target);

        // Otherwise
        else return "invalid";
    },

    // Attacker is a player and target is a player
    _attackerIsPlayerAndTargetIsPlayer(attacker: Player, target: Player): GameAttackReturn {
        // Get the attacker's attack damage, and attack the target with it
        attack.attack(attacker.attack, target);
        game.events.broadcast("Attack", [attacker, target], attacker);
        
        // The attacker can't attack anymore this turn.
        attacker.canAttack = false;
        attack._removeDurabilityFromWeapon(attacker, target);

        return true;
    },

    // Attacker is a player and target is a card
    _attackerIsPlayerAndTargetIsCard(attacker: Player, target: Card): GameAttackReturn {
        // If the target has stealth, the attacker can't attack it
        if (target.keywords.includes("Stealth")) return "stealth";

        // The attacker should damage the target
        game.attack(attacker.attack, target);
        game.attack(target.getAttack(), attacker);
        game.events.broadcast("Attack", [attacker, target], attacker);

        game.killMinions();

        // The attacker can't attack anymore this turn.
        attacker.canAttack = false;

        // Remove frenzy
        attack._doFrenzy(target);

        game.killMinions();
        attack._removeDurabilityFromWeapon(attacker, target);

        return true;
    },

    // Attacker is a card
    _attackerIsCard(attacker: Card, target: Target): GameAttackReturn {
        if (attacker.dormant) return "dormant";
        if (attacker.attackTimes && attacker.attackTimes <= 0) return "hasattacked";
        if (attacker.sleepy) return "sleepy";
        if (attacker.getAttack() <= 0) return "noattack";

        // Target is a player
        if (target.classType == "Player") return attack._attackerIsCardAndTargetIsPlayer(attacker, target);

        // Target is a minion
        else if (target.classType == "Card") return attack._attackerIsCardAndTargetIsCard(attacker, target);

        // Otherwise
        else return "invalid";
    },

    // Attacker is a card and target is a player
    _attackerIsCardAndTargetIsPlayer(attacker: Card, target: Player): GameAttackReturn {
        if (!attacker.canAttackHero) return "cantattackhero";

        // If attacker has stealth, remove it
        if (attacker.keywords.includes("Stealth")) {
            attacker.removeKeyword("Stealth");
        }

        // If attacker has lifesteal, heal it's owner
        attack._doLifesteal(attacker);

        // Deal damage
        attack.attack(attacker.getAttack(), target);

        // Remember this attack
        attacker.decAttack();
        game.events.broadcast("Attack", [attacker, target], attacker.plr);

        return true;
    },

    // Attacker is a card and target is a card
    _attackerIsCardAndTargetIsCard(attacker: Card, target: Card): GameAttackReturn {
        if (target.keywords.includes("Stealth")) return "stealth";

        attack._attackerIsCardAndTargetIsCardDoAttacker(attacker, target);
        attack._attackerIsCardAndTargetIsCardDoTarget(attacker, target);

        game.events.broadcast("Attack", [attacker, target], attacker.plr);

        return true;
    },
    _attackerIsCardAndTargetIsCardDoAttacker(attacker: Card, target: Card): GameAttackReturn {
        // Cleave
        attack._cleave(attacker, target);

        attacker.decAttack();
        attacker.removeKeyword("Stealth");

        const shouldDamage = attack._cardAttackHelper(attacker);
        if (!shouldDamage) return true;

        attack.attack(target.getAttack(), attacker);
        
        // Remove frenzy
        attack._doFrenzy(attacker);

        // If the target has poison, kill the attacker
        attack._doPoison(target, attacker);

        return true;
    },
    _attackerIsCardAndTargetIsCardDoTarget(attacker: Card, target: Card): GameAttackReturn {
        const shouldDamage = attack._cardAttackHelper(target);
        if (!shouldDamage) return true;

        attack.attack(attacker.getAttack(), target);

        attack._doLifesteal(attacker);
        attack._doPoison(attacker, target);

        // Remove frenzy
        attack._doFrenzy(target);
        if (target.getHealth() < 0) attacker.activate("overkill");
        if (target.getHealth() == 0) attacker.activate("honorablekill");

        return true;
    },

    // Helper functions
    _cardAttackHelper(card: Card): boolean {
        if (card.immune) return false;

        if (card.keywords.includes("Divine Shield")) {
            card.removeKeyword("Divine Shield");
            return false;
        }

        return true;
    },

    _cleave(attacker: Card, target: Card): void {
        if (!attacker.keywords.includes("Cleave")) return;

        let board = game.board[target.plr.id];
        let index = board.indexOf(target);

        let below = board[index - 1];
        let above = board[index + 1];

        // If there is a card below the target, also deal damage to it.
        if (below) game.attack(attacker.getAttack(), below);

        // If there is a card above the target, also deal damage to it.
        if (above) game.attack(attacker.getAttack(), above);
    },

    _doFrenzy(card: Card): void {
        if (card.getHealth() <= 0) return;

        // The card has more than 0 health
        if (card.activate("frenzy") !== -1) card.abilities.frenzy = undefined;
    },

    _doPoison(poisonCard: Card, other: Card): void {
        if (!poisonCard.keywords.includes("Poisonous")) return;

        // The attacker has poison
        other.kill();
    },

    _doLifesteal(attacker: Card): void {
        if (!attacker.keywords.includes("Lifesteal")) return;

        // The attacker has lifesteal
        attacker.plr.addHealth(attacker.getAttack());
    },

    _spellDamage(attacker: number | string, target: Target): number {
        if (typeof attacker !== "string") return attacker;

        // The attacker is a string but not spelldamage syntax
        let spellDmgRegex = /\$(\d+?)/;
        let match = attacker.match(spellDmgRegex);
        
        if (!match) throw new TypeError("Non-spelldamage string passed into attack.");

        let dmg = parseInt(match[1]);
        dmg += game.player.spellDamage;

        game.events.broadcast("SpellDealsDamage", [target, dmg], game.player);
        return dmg;
    },

    _removeDurabilityFromWeapon(attacker: Player, target: Target): void {
        const wpn = attacker.weapon;
        if (!wpn) return;

        // If the weapon would be part of the attack, remove 1 durability
        if (wpn.attackTimes && wpn.attackTimes > 0 && wpn.getAttack()) {
            wpn.attackTimes -= 1;
            wpn.remStats(0, 1);

            if (target instanceof Card) attack._doPoison(wpn, target);
        }

        game.killMinions();
    }
}

const playCard = {
    /**
     * Play a card
     * 
     * @param card The card to play
     * @param player The card's owner
     */
    play(card: Card, player: Player): GamePlayCardReturn {
        // Make sure the parameters are valid
        if (!card || !player) {
            if (game.evaling) throw new TypeError("Evaling Error - The `card` or `player` argument passed to `playCard` are invalid. Make sure you passed in both arguments.");
            return "invalid";
        }

        game.killMinions();

        // Trade
        if (playCard._trade(card, player)) return "traded";

        // Cost
        if (player[card.costType] < card.cost) return "cost";

        // Condition
        if (!playCard._condition(card, player)) return "refund";

        // Charge you for the card
        player[card.costType] -= card.cost;
        player.removeFromHand(card);

        // Counter
        if (playCard._countered(card, player)) return "counter";

        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (!playCard._hasCapacity(card, player)) return "space";

        // Broadcast `PlayCardUnsafe` event without adding it to the history
        game.events.broadcast("PlayCardUnsafe", card, player, false);

        // Finale
        if (player[card.costType] == 0) card.activate("finale");

        // Store the result of the type-specific code
        let result: GamePlayCardReturn = true;

        // Type specific code
        switch (card.type) {
            case "Minion":
                result = playCard._playMinion(card, player);
                break;
            case "Spell":
                result = playCard._playSpell(card, player);
                break;
            case "Weapon":
                result = playCard._playWeapon(card, player);
                break;
            case "Hero":
                result = playCard._playHero(card, player);
                break;
            case "Location":
                result = playCard._playLocation(card, player);
                break;
            default:
                throw new TypeError("Cannot handle playing card of type: " + card.type);
        }

        // Refund
        if (result === "refund") return result;

        // Add the `PlayCardUnsafe` event to the history, now that it's safe to do so
        game.events.addHistory("PlayCardUnsafe", card, player);

        // Echo
        playCard._echo(card, player);

        // Combo
        playCard._combo(card, player);

        // Broadcast `PlayCard` event
        game.events.broadcast("PlayCard", card, player);

        playCard._corrupt(card, player);
        game.killMinions();

        return result;
    },

    _playMinion(card: Card, player: Player): GamePlayCardReturn {
        // Magnetize
        if (playCard._magnetize(card, player)) return "magnetize";

        if (!card.dormant) {
            if (card.activateBattlecry() === -1) return "refund";
        }

        let unsuppress = functions.suppressEvent("SummonMinion");
        let ret = cards.summon(card, player);
        unsuppress();

        return ret;
    },

    _playSpell(card: Card, player: Player): GamePlayCardReturn {
        if (card.activate("cast") === -1) return "refund";

        // Twinspell functionality
        if (card.keywords.includes("Twinspell")) {
            card.removeKeyword("Twinspell");
            card.desc = card.desc?.split("Twinspell")[0].trim();

            player.addToHand(card);
        }

        // Spellburst functionality
        game.board[player.id].forEach(m => {
            m.activate("spellburst");
            m.abilities.spellburst = undefined;
        });

        return true;
    },

    _playWeapon(card: Card, player: Player): GamePlayCardReturn {
        if (card.activateBattlecry() === -1) return "refund";

        player.setWeapon(card);
        return true;
    },

    _playHero(card: Card, player: Player): GamePlayCardReturn {
        if (card.activateBattlecry() === -1) return "refund";

        player.setHero(card, 5);
        return true;
    },

    _playLocation(card: Card, player: Player): GamePlayCardReturn {
        card.setStats(0, card.getHealth());
        card.immune = true;
        card.cooldown = 0;

        let unsuppress = functions.suppressEvent("SummonMinion");
        let ret = cards.summon(card, player);
        unsuppress();

        return ret;
    },

    _trade(card: Card, player: Player): boolean {
        if (!card.keywords.includes("Tradeable")) return false;

        let q;

        if (player.ai) q = player.ai.trade(card);
        else {
            game.interact.printAll(player);
            q = game.interact.yesNoQuestion(player, "Would you like to trade " + functions.colorByRarity(card.displayName, card.rarity) + " for a random card in your deck?");
        }

        if (!q) return false;
        
        if (player.mana < 1) return false;

        player.mana -= 1;

        player.removeFromHand(card);
        player.drawCard();
        player.shuffleIntoDeck(card);

        game.events.broadcast("TradeCard", card, player);

        return true;
    },

    _hasCapacity(card: Card, player: Player): boolean {
        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (game.board[player.id].length < game.config.general.maxBoardSpace || !game.functions.canBeOnBoard(card)) return true;

        // Refund
        let unsuppress = functions.suppressEvent("AddCardToHand");
        player.addToHand(card);
        unsuppress();

        if (card.costType == "mana") player.refreshMana(card.cost);
        else player[card.costType] += card.cost;

        return false;
    },

    _condition(card: Card, player: Player): boolean {
        let condition = card.activate("condition");
        if (!(condition instanceof Array)) return true;

        // This is if the condition is cleared
        let cleared = condition[0];
        if (cleared === true) return true;

        // Warn the user that the condition is not fulfilled
        const warnMessage = "<yellow>WARNING: This card's condition is not fulfilled. Are you sure you want to play this card?</yellow>";

        game.interact.printAll(player);
        let warn = game.interact.yesNoQuestion(player, warnMessage);

        if (!warn) return false;
        return true;
    },

    _countered(card: Card, player: Player): boolean {
        let op = player.getOpponent();

        // Check if the card is countered
        if (op.counter && op.counter.includes(card.type)) {
            functions.remove(op.counter, card.type);
            return true;
        }

        return false;
    },

    _echo(card: Card, player: Player): boolean {
        if (!card.keywords.includes("Echo")) return false;

        let echo = card.perfectCopy(); // Create an exact copy of the card played
        echo.echo = true;

        player.addToHand(echo);
        return true;
    },

    _combo(card: Card, player: Player): boolean {
        if (!game.events.events.PlayCard) return false

        // Get the player's PlayCard event history
        let stat = game.events.events.PlayCard[player.id];
        if (stat.length <= 0) return false;

        // Get the latest event
        let latest = functions.last(stat);
        let latestCard: Card = latest[0];

        // If the previous card played was played on the same turn as this one, activate combo
        if (latestCard.turn == game.turns) card.activate("combo");
        return true;
    },

    _corrupt(card: Card, player: Player): boolean {
        player.hand.forEach(toCorrupt => {
            if (toCorrupt.corrupt === undefined || card.cost <= toCorrupt.cost) return;

            // Corrupt that card
            let corrupted = new Card(toCorrupt.corrupt, player);

            player.removeFromHand(toCorrupt);

            let unsuppress = functions.suppressEvent("AddCardToHand");
            player.addToHand(corrupted);
            unsuppress();
        });

        return true;
    },

    _magnetize(card: Card, player: Player): boolean {
        const board = game.board[player.id];

        if (!card.keywords.includes("Magnetic") || board.length <= 0) return false;

        // Find the mechs on the board
        const mechs = board.filter(m => m.tribe?.includes("Mech"));
        if (mechs.length <= 0) return false;

        // I'm using while loops to prevent a million indents
        let minion = game.interact.selectCardTarget("Which minion do you want game to Magnetize to:", null, "friendly");
        if (!minion) return false;

        if (!minion.tribe?.includes("Mech")) {
            game.log("That minion is not a Mech.");
            return playCard._magnetize(card, player);
        }

        minion.addStats(card.getAttack(), card.getHealth());

        card.keywords.forEach(k => {
            // TSC for some reason, forgets that minion should be of `Card` type here, so we have to remind it. This is a workaround
            if (!(minion instanceof Card)) return;

            minion.addKeyword(k);
        });

        if (minion.maxHealth && card.maxHealth) {
            minion.maxHealth += card.maxHealth;
        }

        if (card.abilities.deathrattle) {
            card.abilities.deathrattle.forEach(d => {
                // Look at the comment above
                if (!minion) throw new Error("Target wasn't found.");

                minion.addDeathrattle(d);
            });
        }

        // Echo
        playCard._echo(card, player);

        // Corrupt
        playCard._corrupt(card, player);

        return true;
    }
}

const cards = {
    play: playCard,

    /**
     * Summon a minion.
     * Broadcasts the `SummonMinion` event
     * 
     * @param minion The minion to summon
     * @param player The player who gets the minion
     * @param trigger_colossal If the minion has colossal, summon the other minions.
     * 
     * @returns The minion summoned
     */
    summon(minion: Card, player: Player, trigger_colossal: boolean = true): Card | "space" | "colossal" | "invalid" {
        if (!minion || !player) {
            if (game.evaling) throw new TypeError("Evaling Error - The `minion` or `player` argument passed to `summonMinion` are invalid. Make sure you passed in both arguments.");
            return "invalid";
        };

        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (game.board[player.id].length >= game.config.general.maxBoardSpace) return "space";
        game.events.broadcast("SummonMinion", minion, player);

        player.spellDamage = 0;

        if (minion.keywords.includes("Charge")) minion.sleepy = false;

        if (minion.keywords.includes("Rush")) {
            minion.sleepy = false;
            minion.canAttackHero = false;
        }

        if (minion.colossal && trigger_colossal) {
            // minion.colossal is a string array.
            // example: ["Left Arm", "", "Right Arm"]
            // the "" gets replaced with the main minion

            minion.colossal.forEach(v => {
                let unsuppress = functions.suppressEvent("SummonMinion");

                if (v == "") {
                    game.summonMinion(minion, player, false);
                    unsuppress();
                    return;
                }

                let card = new Card(v, player);
                card.dormant = minion.dormant;

                game.summonMinion(card, player);
                unsuppress();
            });

            return "colossal";
        }

        if (minion.dormant) {
            minion.dormant += game.turns;
            minion.immune = true;
            minion.sleepy = false;
        }

        game.board[player.id].push(minion);

        game.board[player.id].forEach(m => {
            m.keywords.forEach(k => {
                if (k.startsWith("Spell Damage +")) player.spellDamage += parseInt(k.split("+")[1]);
            });
        });

        return minion;
    }
};
