/**
 * Game
 * @module Game
 */
import { functions, interact, Player, Card, AI, CardError, EventManager } from "../internal.js";
import { Blueprint, CardAbility, CardKeyword, EventKey, GameAttackReturn, GameConstants, GamePlayCardReturn, Target, UnknownEventValue } from "../types.js";
import { config } from '../../config.js';
import _ from "lodash";

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
    events = EventManager;

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
    config = config;

    /**
     * All of the blueprints cards that have been implemented so far.
     * Don't use this if you don't know what you're doing.
     * 
     * Use `functions.getCards()` instead.
     */
    blueprints: Blueprint[] = [];

    /**
     * All of the cards that have been implemented so far.
     * 
     * Use `functions.getCards()` instead.
     */
    cards: Card[] = [];

    playCard = cards.play.play;
    summonMinion = cards.summon;

    attack = attack.attack;

    Card = Card;
    CardError = CardError;

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
    eventListeners: {[key: number]: (key: EventKey, val: UnknownEventValue, eventPlayer: Player) => void} = {};

    /**
     * Whether or not the game is currently accepting input from the user.
     * 
     * If this is true, the user can't interact with the game. This will most likely cause an infinite loop, unless both players are ai's.
     */
    noInput: boolean = false;

    /**
     * Whether or not the game is currently outputting anything to the console.
     */
    noOutput: boolean = false;

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
     * If the program is currently replaying a previous game.
     */
    replaying: boolean = false;

    /**
     * Some constant values.
     */
    constants: GameConstants;

    /**
     * Cache for the game.
     */
    cache: {[key: string]: any} = {};

    lodash = _;

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
        // Set this to player 1 temporarily, in order to never be null
        this.player1 = player1;
        this.player2 = player2;

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

        // Some constants
        this.constants = {
            REFUND: -1
        };
    }

    /**
     * Ask the user a question and returns their answer
     *
     * @param q The question to ask
     * @param care If this is false, it overrides `game.noInput`. Only use this when debugging.
     *
     * @returns What the user answered
     */
    input(q: string = "", care: boolean = true, useInputQueue: boolean = true): string {
        return interact.gameLoop.input(q, care, useInputQueue);
    }

    /**
     * Wrapper for console.log 
     */
    log(...data: any) {
        return interact.gameLoop.log(...data);
    }

    /**
     * Wrapper for console.error
     */
    logError(...data: any) {
        return interact.gameLoop.logError(...data);
    }

    /**
     * Wrapper for console.warn
     */
    logWarn(...data: any) {
        return interact.gameLoop.logWarn(...data);
    }

    /**
     * Pause the game until the user presses the enter key.
     * Use this instead of `input` if you don't care about the return value for clarity.
     * 
     * @param [prompt="Press enter to continue..."] The prompt to show the user
     */
    pause(prompt = "Press enter to continue...") {
        interact.gameLoop.input(prompt);
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
    triggerEventListeners(key: EventKey, val: UnknownEventValue, player: Player): any[] {
        const ret: any[] = [];
        Object.values(this.eventListeners).forEach(i => ret.push(i(key, val, player)));
        return ret;
    }

    // Start / End

    /**
     * Starts the game
     * 
     * @returns Success
     */
    startGame(): boolean {
        const players = [];

        // Add quest cards to the players hands
        for (let i = 0; i < 2; i++) {
            // Set the player's hero to the default hero for the class
            const plr = functions.util.getPlayerFromId(i);
            
            const success = plr.setToStartingHero();
            if (!success) {
                game.log("File 'cards/StartingHeroes/" + plr.heroClass.toLowerCase().replaceAll(" ", "_") + ".ts' is either; Missing or Incorrect. Please copy the working 'cards/StartingHeroes/' folder from the github repo to restore a working copy. Error Code: 12");
                process.exit(1);
            }

            plr.deck.forEach(c => {
                if (!c.text?.includes("Quest: ") && !c.text?.includes("Questline: ")) return;

                const unsuppress = functions.event.suppress("AddCardToHand");
                plr.addToHand(c);
                unsuppress();

                plr.deck.splice(plr.deck.indexOf(c), 1);
            });

            const nCards = (plr.id == 0) ? 3 : 4;
            while (plr.hand.length < nCards) {
                const unsuppress = functions.event.suppress("DrawCard");
                plr.drawCard();
                unsuppress();
            }

            plr.deck.forEach(c => c.activate("startofgame"));
            plr.hand.forEach(c => c.activate("startofgame"));

            players.push(plr);
        }

        this.player1 = players[0];
        this.player2 = players[1];

        this.player1.emptyMana = 1;
        this.player1.mana = 1;

        const coin = new Card("The Coin", this.player2);

        const unsuppress = functions.event.suppress("AddCardToHand");
        this.player2.addToHand(coin);
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

        this.interact.info.printName();

        this.input(`Player ${winner.name} wins!\n`);

        this.running = false;

        // Create log file
        functions.util.createLogFile();

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

        const plr = this.player;
        const op = this.opponent;

        this.board[plr.id].forEach(m => {
            m.ready();
        });

        // Trigger unspent mana
        if (plr.mana > 0) this.events.broadcast("UnspentMana", plr.mana, plr);

        // Remove echo cards
        plr.hand = plr.hand.filter(c => !c.hasKeyword("Echo"));
        plr.canAttack = true;

        // Turn starts
        this.turns++;
        
        // Mana stuff
        op.gainEmptyMana(1);
        op.mana = op.emptyMana - op.overload;
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
            let dormant: number | undefined = m.getKeyword("Dormant");

            if (dormant) {
                if (this.turns <= dormant) return;

                // Remove dormant
                m.remKeyword("Dormant");
                m.sleepy = true;

                if (Object.keys(m.backups.init.keywords).includes("Immune")) m.addKeyword("Immune");

                m.turn = this.turns;

                // HACK: If the battlecry use a function that depends on `game.player`
                this.player = op;
                m.activate("battlecry");
                this.player = plr;

                return;
            }

            m.canAttackHero = true;
            if (this.turns > (m.turnFrozen ?? -1) + 1) m.remKeyword("Frozen");
            m.ready();

            // Stealth duration
            if (m.stealthDuration && m.stealthDuration > 0 && this.turns > m.stealthDuration) {
                m.stealthDuration = 0;
                m.remKeyword("Stealth");
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
            const plr = functions.util.getPlayerFromId(p);

            const sparedMinions: Card[] = [];
            const shouldSpare = (card: Card) => {
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

                if (!m.hasKeyword("Reborn")) return;

                // Reborn
                const minion = m.imperfectCopy();
                minion.remKeyword("Reborn")

                // Reduce the minion's health to 1, keep the minion's attack the same
                minion.setStats(minion.getAttack(), 1);

                const unsuppress = functions.event.suppress("SummonMinion");
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
                minion.activate("passive", "reborn", m, this.player);

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
    functions.card.importAll();
    game.doConfigAI();

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

        let returnValue: GameAttackReturn;

        if (target instanceof Card && target.hasKeyword("Immune")) return "immune";
        else if (target instanceof Player && target.immune) return "immune";

        // Attacker is a number
        if (typeof attacker === "string" || typeof attacker === "number") {
            returnValue = attack._attackerIsNum(attacker, target);
            game.killMinions();
            return returnValue;
        }

        // The attacker is a card or player
        if (attacker instanceof Card && attacker.hasKeyword("Frozen")) return "frozen";
        else if (attacker instanceof Player && attacker.frozen) return "frozen";

        // Check if there is a minion with taunt
        const taunts = game.board[game.opponent.id].filter(m => m.hasKeyword("Taunt"));
        if (taunts.length > 0) {
            // If the target is a card and has taunt, you are allowed to attack it
            if (target instanceof Card && target.hasKeyword("Taunt")) {}
            else return "taunt";
        }

        // Attacker is a player
        if (attacker.classType === "Player") returnValue = attack._attackerIsPlayer(attacker, target);

        // Attacker is a minion
        else if (attacker.classType === "Card") returnValue = attack._attackerIsCard(attacker, target);

        // Otherwise
        else return "invalid";

        game.killMinions();
        return returnValue;
    },

    // Attacker is a number
    _attackerIsNum(attacker: number | string, target: Target): GameAttackReturn {
        // Attacker is a number
        // Spell damage
        const dmg = attack._spellDamage(attacker, target);

        if (target.classType == "Player") {
            target.remHealth(dmg);
            return true;
        }

        if (target.hasKeyword("Divine Shield")) {
            target.remKeyword("Divine Shield");
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
        if (target.hasKeyword("Stealth")) return "stealth";

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
        if (attacker instanceof Card && attacker.hasKeyword("Dormant")) return "dormant";
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
        if (attacker.hasKeyword("Stealth")) {
            attacker.remKeyword("Stealth");
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
        if (target.hasKeyword("Stealth")) return "stealth";

        attack._attackerIsCardAndTargetIsCardDoAttacker(attacker, target);
        attack._attackerIsCardAndTargetIsCardDoTarget(attacker, target);

        game.events.broadcast("Attack", [attacker, target], attacker.plr);

        return true;
    },
    _attackerIsCardAndTargetIsCardDoAttacker(attacker: Card, target: Card): GameAttackReturn {
        // Cleave
        attack._cleave(attacker, target);

        attacker.decAttack();
        attacker.remKeyword("Stealth");

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
        if (card.hasKeyword("Immune")) return false;

        if (card.hasKeyword("Divine Shield")) {
            card.remKeyword("Divine Shield");
            return false;
        }

        return true;
    },

    _cleave(attacker: Card, target: Card): void {
        if (!attacker.hasKeyword("Cleave")) return;

        const board = game.board[target.plr.id];
        const index = board.indexOf(target);

        const below = board[index - 1];
        const above = board[index + 1];

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
        if (!poisonCard.hasKeyword("Poisonous")) return;

        // The attacker has poison
        other.kill();
    },

    _doLifesteal(attacker: Card): void {
        if (!attacker.hasKeyword("Lifesteal")) return;

        // The attacker has lifesteal
        attacker.plr.addHealth(attacker.getAttack());
    },

    _spellDamage(attacker: number | string, target: Target): number {
        if (typeof attacker !== "string") return attacker;

        // The attacker is a string but not spelldamage syntax
        const spellDmgRegex = /\$(\d+?)/;
        const match = attacker.match(spellDmgRegex);
        
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
        functions.util.remove(player.hand, card);

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
        // HACK: Use of never
        const typeFunction: Function = playCard.typeSpecific[card.type as never];
        if (!typeFunction) throw new TypeError("Cannot handle playing card of type: " + card.type);

        result = typeFunction(card, player);

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

    // Card type specific code
    typeSpecific: {
        Minion(card: Card, player: Player): GamePlayCardReturn {
            // Magnetize
            if (playCard._magnetize(card, player)) return "magnetize";

            if (!card.hasKeyword("Dormant")) {
                if (card.activate("battlecry") === -1) return "refund";
            }

            const unsuppress = functions.event.suppress("SummonMinion");
            const ret = cards.summon(card, player);
            unsuppress();

            return ret;
        },

        Spell(card: Card, player: Player): GamePlayCardReturn {
            if (card.activate("cast") === -1) return "refund";

            // Twinspell functionality
            if (card.hasKeyword("Twinspell")) {
                card.remKeyword("Twinspell");
                card.text = card.text?.split("Twinspell")[0].trim();

                player.addToHand(card);
            }

            // Spellburst functionality
            game.board[player.id].forEach(m => {
                m.activate("spellburst");
                m.abilities.spellburst = undefined;
            });

            return true;
        },

        Weapon(card: Card, player: Player): GamePlayCardReturn {
            if (card.activate("battlecry") === -1) return "refund";

            player.setWeapon(card);
            return true;
        },

        Hero(card: Card, player: Player): GamePlayCardReturn {
            if (card.activate("battlecry") === -1) return "refund";

            player.setHero(card, 5);
            return true;
        },

        Location(card: Card, player: Player): GamePlayCardReturn {
            card.setStats(0, card.getHealth());
            card.addKeyword("Immune");
            card.cooldown = 0;

            const unsuppress = functions.event.suppress("SummonMinion");
            const ret = cards.summon(card, player);
            unsuppress();

            return ret;
        }
    },

    _trade(card: Card, player: Player): boolean {
        if (!card.hasKeyword("Tradeable")) return false;

        let q;

        if (player.ai) q = player.ai.trade(card);
        else {
            interact.info.printAll(player);
            q = interact.yesNoQuestion(player, "Would you like to trade " + functions.color.fromRarity(card.displayName, card.rarity) + " for a random card in your deck?");
        }

        if (!q) return false;
        
        if (player.mana < 1) return false;

        player.mana -= 1;

        functions.util.remove(player.hand, card);
        player.drawCard();
        player.shuffleIntoDeck(card);

        game.events.broadcast("TradeCard", card, player);

        return true;
    },

    _hasCapacity(card: Card, player: Player): boolean {
        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (game.board[player.id].length < game.config.general.maxBoardSpace || !card.canBeOnBoard()) return true;

        // Refund
        const unsuppress = functions.event.suppress("AddCardToHand");
        player.addToHand(card);
        unsuppress();

        if (card.costType == "mana") player.refreshMana(card.cost);
        else player[card.costType] += card.cost;

        return false;
    },

    _condition(card: Card, player: Player): boolean {
        const condition = card.activate("condition");
        if (!(condition instanceof Array)) return true;

        // This is if the condition is cleared
        const cleared = condition[0];
        if (cleared === true) return true;

        // Warn the user that the condition is not fulfilled
        const warnMessage = "<yellow>WARNING: This card's condition is not fulfilled. Are you sure you want to play this card?</yellow>";

        interact.info.printAll(player);
        const warn = interact.yesNoQuestion(player, warnMessage);

        if (!warn) return false;
        return true;
    },

    _countered(card: Card, player: Player): boolean {
        const op = player.getOpponent();

        // Check if the card is countered
        if (op.counter && op.counter.includes(card.type)) {
            functions.util.remove(op.counter, card.type);
            return true;
        }

        return false;
    },

    _echo(card: Card, player: Player): boolean {
        if (!card.hasKeyword("Echo")) return false;

        // Create an exact copy of the card played
        const echo = card.perfectCopy();
        echo.addKeyword("Echo");

        player.addToHand(echo);
        return true;
    },

    _combo(card: Card, player: Player): boolean {
        if (!game.events.events.PlayCard) return false

        // Get the player's PlayCard event history
        const stat = game.events.events.PlayCard[player.id];
        if (stat.length <= 0) return false;

        // Get the latest event
        const latest = game.lodash.last(stat);
        const latestCard: Card = latest?.[0];

        // If the previous card played was played on the same turn as this one, activate combo
        if (latestCard.turn == game.turns) card.activate("combo");
        return true;
    },

    _corrupt(card: Card, player: Player): boolean {
        player.hand.forEach(toCorrupt => {
            let corrupt: string | undefined = toCorrupt.getKeyword("Corrupt");
            if (!corrupt || card.cost <= toCorrupt.cost) return;

            // Corrupt that card
            const corrupted = new Card(corrupt, player);

            functions.util.remove(player.hand, toCorrupt);

            const unsuppress = functions.event.suppress("AddCardToHand");
            player.addToHand(corrupted);
            unsuppress();
        });

        return true;
    },

    _magnetize(card: Card, player: Player): boolean {
        const board = game.board[player.id];

        if (!card.hasKeyword("Magnetic") || board.length <= 0) return false;

        // Find the mechs on the board
        const mechs = board.filter(m => m.tribe?.includes("Mech"));
        if (mechs.length <= 0) return false;

        // I'm using while loops to prevent a million indents
        const mech = interact.selectCardTarget("Which minion do you want this card to Magnetize to:", null, "friendly");
        if (!mech) return false;

        if (!mech.tribe?.includes("Mech")) {
            game.log("That minion is not a Mech.");
            return playCard._magnetize(card, player);
        }

        mech.addStats(card.getAttack(), card.getHealth());

        Object.keys(card.keywords).forEach(k => {
            // TSC for some reason, forgets that minion should be of `Card` type here, so we have to remind it. This is a workaround
            if (!(mech instanceof Card)) return;

            mech.addKeyword(k as CardKeyword);
        });

        if (mech.maxHealth && card.maxHealth) {
            mech.maxHealth += card.maxHealth;
        }

        // Transfer the abilities over.
        Object.entries(card.abilities).forEach(ent => {
            const [key, val] = ent;

            val.forEach(ability => {
                // Look at the comment above
                if (!mech) throw new Error("Target wasn't found.");

                mech.addAbility(key as CardAbility, ability);
            });
        });

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
     * @param colossal If the minion has colossal, summon the other minions.
     * 
     * @returns The minion summoned
     */
    summon(minion: Card, player: Player, colossal: boolean = true): true | "space" | "colossal" | "invalid" {
        if (!minion || !player) {
            if (game.evaling) throw new TypeError("Evaling Error - The `minion` or `player` argument passed to `summonMinion` are invalid. Make sure you passed in both arguments.");
            return "invalid";
        };

        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (game.board[player.id].length >= game.config.general.maxBoardSpace) return "space";
        game.events.broadcast("SummonMinion", minion, player);

        player.spellDamage = 0;

        if (minion.hasKeyword("Charge")) minion.sleepy = false;

        if (minion.hasKeyword("Rush")) {
            minion.sleepy = false;
            minion.canAttackHero = false;
        }

        let dormant: number | undefined = minion.getKeyword("Dormant");

        let colossalMinions: string[] | undefined = minion.getKeyword("Colossal");
        if (colossalMinions && colossal) {
            // minion.colossal is a string array.
            // example: ["Left Arm", "", "Right Arm"]
            // the "" gets replaced with the main minion

            colossalMinions.forEach(v => {
                const unsuppress = functions.event.suppress("SummonMinion");

                if (v == "") {
                    game.summonMinion(minion, player, false);
                    unsuppress();
                    return;
                }

                const card = new Card(v, player);

                if (dormant) card.addKeyword("Dormant", dormant);

                game.summonMinion(card, player);
                unsuppress();
            });

            return "colossal";
        }

        if (dormant) {
            // Oh no... Why is this not documented?
            minion.setKeyword("Dormant", dormant + game.turns);
            minion.addKeyword("Immune");
            minion.sleepy = false;
        }

        game.board[player.id].push(minion);

        game.board[player.id].forEach(m => {
            Object.keys(m.keywords).forEach(k => {
                if (k.startsWith("Spell Damage +")) player.spellDamage += parseInt(k.split("+")[1]);
            });
        });

        return true;
    }
};
