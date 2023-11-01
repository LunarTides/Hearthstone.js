/**
 * Game
 * @module Game
 */
import _ from 'lodash';
import { FUNCTIONS, INTERACT, Player, Card, Ai, EVENT_MANAGER } from '../internal.js';
import { type Blueprint, type CardAbility, type CardKeyword, type EventKey, type GameAttackReturn, type GameConstants, type GamePlayCardReturn, type Target, type UnknownEventValue } from '../types.js';
import { CONFIG } from '../../config.js';

export class Game {
    /**
     * Some general functions that can be used.
     *
     * This has a lot of abstraction, so don't be afraid to use them.
     * Look in here for more.
     */
    functions = FUNCTIONS;

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
    events = EVENT_MANAGER;

    /**
     * This has a lot of functions for interacting with the user.
     *
     * This is generally less useful than the `functions` object, since the majority of these functions are only used once in the source code.
     * However, some functions are still useful. For example, the `selectTarget` function.
     */
    interact = INTERACT;

    /**
     * Some configuration for the game.
     *
     * Look in the `config` folder.
     */
    config = CONFIG;

    /**
     * All of the blueprints cards that have been implemented so far.
     * Don't use this if you don't know what you're doing.
     *
     * Use `functions.card.getAll()` instead.
     */
    blueprints: Blueprint[] = [];

    /**
     * All of the cards that have been implemented so far.
     *
     * Use `functions.card.getAll()` instead.
     */
    cards: Card[] = [];

    playCard = CARDS.play.play;
    summonMinion = CARDS.summon;

    attack = ATTACK.attack;

    /**
     * The turn counter.
     *
     * This goes up at the beginning of each player's turn.
     *
     * This means that, for example, if `Player 1`'s turn is on turn 0, then when it's `Player 1`'s turn again, the turn counter is 2.
     *
     * Do
     * ```
     * game.functions.util.getTraditionalTurnCounter();
     * ```
     * for a more conventional turn counter.
     */
    turns = 0;

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
    eventListeners: Record<number, (key: EventKey, value: UnknownEventValue, eventPlayer: Player) => void> = {};

    /**
     * Whether or not the game is currently accepting input from the user.
     *
     * If this is true, the user can't interact with the game. This will most likely cause an infinite loop, unless both players are ai's.
     */
    noInput = false;

    /**
     * Whether or not the game is currently outputting anything to the console.
     */
    noOutput = false;

    /**
     * If the game is currently running.
     *
     * If this is false, the game loop will end.
     */
    running = true;

    /**
     * Some constant values.
     */
    constants: GameConstants;

    /**
     * Cache for the game.
     */
    cache: Record<string, any> = {};

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
            REFUND: -1,
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
    input(q = '', care = true, useInputQueue = true): string {
        return INTERACT.gameLoop.input(q, care, useInputQueue);
    }

    /**
     * Wrapper for console.log
     */
    log(...data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        INTERACT.gameLoop.log(...data);
    }

    /**
     * Wrapper for console.error
     */
    logError(...data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        INTERACT.gameLoop.logError(...data);
    }

    /**
     * Wrapper for console.warn
     */
    logWarn(...data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        INTERACT.gameLoop.logWarn(...data);
    }

    /**
     * Pause the game until the user presses the enter key.
     * Use this instead of `input` if you don't care about the return value for clarity.
     *
     * @param [prompt="Press enter to continue..."] The prompt to show the user
     */
    pause(prompt = 'Press enter to continue...') {
        INTERACT.gameLoop.input(prompt);
    }

    /**
     * Assigns an ai to the players if in the config.
     *
     * Unassigns the player's ai's if not in the config.
     *
     * @returns Success
     */
    doConfigAi(): boolean {
        if (this.config.ai.player1) {
            if (!this.player1.ai) {
                this.player1.ai = new Ai(this.player1);
            }
        } else {
            this.player1.ai = undefined;
        }

        if (this.config.ai.player2) {
            if (!this.player2.ai) {
                this.player2.ai = new Ai(this.player2);
            }
        } else {
            this.player2.ai = undefined;
        }

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
    triggerEventListeners(key: EventKey, value: UnknownEventValue, player: Player) {
        for (const eventListener of Object.values(this.eventListeners)) {
            eventListener(key, value, player);
        }
    }

    // Start / End

    /**
     * Starts the game
     *
     * @returns Success
     */
    startGame(): boolean {
        const PLAYERS = [];

        // Add quest cards to the players hands
        for (let i = 0; i < 2; i++) {
            // Set the player's hero to the default hero for the class
            const PLAYER = FUNCTIONS.util.getPlayerFromId(i);

            const SUCCESS = PLAYER.setToStartingHero();
            if (!SUCCESS) {
                throw new Error('File \'cards/StartingHeroes/' + PLAYER.heroClass.toLowerCase().replaceAll(' ', '_') + '.ts\' is either; Missing or Incorrect. Please copy the working \'cards/StartingHeroes/\' folder from the github repo to restore a working copy. Error Code: 12');
            }

            for (const CARD of PLAYER.deck) {
                if (!CARD.text.includes('Quest: ') && !CARD.text.includes('Questline: ')) {
                    continue;
                }

                const unsuppress = FUNCTIONS.event.suppress('AddCardToHand');
                PLAYER.addToHand(CARD);
                unsuppress();

                PLAYER.deck.splice(PLAYER.deck.indexOf(CARD), 1);
            }

            const AMOUNT_OF_CARDS = (PLAYER.id === 0) ? 3 : 4;
            while (PLAYER.hand.length < AMOUNT_OF_CARDS) {
                const unsuppress = FUNCTIONS.event.suppress('DrawCard');
                PLAYER.drawCard();
                unsuppress();
            }

            for (const CARD of PLAYER.deck) {
                CARD.activate('startofgame');
            }

            for (const CARD of PLAYER.hand) {
                CARD.activate('startofgame');
            }

            PLAYERS.push(PLAYER);
        }

        this.player1 = PLAYERS[0];
        this.player2 = PLAYERS[1];

        this.player1.emptyMana = 1;
        this.player1.mana = 1;

        const COIN = new Card('The Coin', this.player2);

        const unsuppress = FUNCTIONS.event.suppress('AddCardToHand');
        this.player2.addToHand(COIN);
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
        if (!winner) {
            return false;
        }

        this.interact.info.watermark();

        this.input(`Player ${winner.name} wins!\n`);

        this.running = false;

        // Create log file
        FUNCTIONS.util.createLogFile();

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
        this.events.broadcast('EndTurn', this.turns, this.player);

        const PLAYER = this.player;
        const OPPONENT = this.opponent;

        for (const CARD of this.board[PLAYER.id]) {
            CARD.ready();
        }

        // Trigger unspent mana
        if (PLAYER.mana > 0) {
            this.events.broadcast('UnspentMana', PLAYER.mana, PLAYER);
        }

        // Remove echo cards
        PLAYER.hand = PLAYER.hand.filter(c => !c.hasKeyword('Echo'));
        PLAYER.canAttack = true;

        // Turn starts
        this.turns++;

        // Mana stuff
        OPPONENT.addEmptyMana(1);
        OPPONENT.mana = OPPONENT.emptyMana - OPPONENT.overload;
        OPPONENT.overload = 0;
        OPPONENT.attack = 0;

        // Weapon stuff
        if (OPPONENT.weapon && OPPONENT.weapon.getAttack() > 0) {
            OPPONENT.attack = OPPONENT.weapon.getAttack();
            OPPONENT.weapon.resetAttackTimes();
        }

        // Chance to spawn in a diy card
        if (this.lodash.random(0, 1, true) <= CONFIG.advanced.diyCardSpawnChance && CONFIG.advanced.spawnInDiyCards) {
            INTERACT.card.spawnInDiyCard(OPPONENT);
        }

        // Minion start of turn
        for (const CARD of this.board[OPPONENT.id]) {
            // Dormant
            const DORMANT = CARD.getKeyword('Dormant') as number | undefined;

            if (DORMANT) {
                if (this.turns <= DORMANT) {
                    continue;
                }

                // Remove dormant
                CARD.remKeyword('Dormant');
                CARD.sleepy = true;

                if (Object.keys(CARD.backups.init.keywords).includes('Immune')) {
                    CARD.addKeyword('Immune');
                }

                CARD.turn = this.turns;

                // HACK: If the battlecry use a function that depends on `game.player`
                this.player = OPPONENT;
                CARD.activate('battlecry');
                this.player = PLAYER;

                continue;
            }

            CARD.canAttackHero = true;
            if (this.turns > (CARD.turnFrozen ?? -1) + 1) {
                CARD.remKeyword('Frozen');
            }

            CARD.ready();

            // Stealth duration
            if (CARD.stealthDuration && CARD.stealthDuration > 0 && this.turns > CARD.stealthDuration) {
                CARD.stealthDuration = 0;
                CARD.remKeyword('Stealth');
            }

            // Location cooldown
            if (CARD.type === 'Location' && CARD.cooldown && CARD.cooldown > 0) {
                CARD.cooldown--;
            }
        }

        // Draw card
        OPPONENT.drawCard();

        OPPONENT.canUseHeroPower = true;

        this.events.broadcast('StartTurn', this.turns, OPPONENT);

        this.player = OPPONENT;
        this.opponent = PLAYER;

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
            const PLAYER = FUNCTIONS.util.getPlayerFromId(p);

            const SPARED: Card[] = [];
            const shouldSpare = (card: Card) => card.getHealth() > 0 || ((card.durability ?? 0) > 0);

            for (const CARD of this.board[p]) {
                if (shouldSpare(CARD)) {
                    continue;
                }

                CARD.activate('deathrattle');
            }

            for (const CARD of this.board[p]) {
                // Add minions with more than 0 health to n.
                if (shouldSpare(CARD)) {
                    SPARED.push(CARD);
                    continue;
                }

                // Calmly tell the minion that it is going to die
                CARD.activate('remove');
                this.events.broadcast('KillMinion', CARD, this.player);

                CARD.turnKilled = this.turns;
                amount++;

                PLAYER.corpses++;
                this.graveyard[p].push(CARD);

                if (!CARD.hasKeyword('Reborn')) {
                    continue;
                }

                // Reborn
                const MINION = CARD.imperfectCopy();
                MINION.remKeyword('Reborn');

                // Reduce the minion's health to 1, keep the minion's attack the same
                MINION.setStats(MINION.getAttack(), 1);

                const unsuppress = FUNCTIONS.event.suppress('SummonMinion');
                this.summonMinion(MINION, PLAYER);
                unsuppress();

                // Activate the minion's passive
                // We're doing this because otherwise, the passive won't be activated this turn
                // Normally when we summon a minion, it will be activated immediately, since the `PlayCard` event gets triggered immediately after playing the card
                // but this is not the case here, since we are directly summoning the minion, and we told it to not broadcast the event.
                // The `reborn` string is passed in order for the card to know why the passive was triggered. The card can explicitly look for the `reborn` string
                // in its passive.
                // So it looks like this:
                // minion.activate(key, reason, minion);
                MINION.activate('passive', 'reborn', CARD, this.player);

                SPARED.push(MINION);
            }

            this.board[p] = SPARED;
        }

        return amount;
    }

    createCard(name: string, owner: Player): Card {
        return new Card(name, owner);
    }
}

export function createGame() {
    const GAME = new Game();
    const PLAYER_1 = new Player('Player 1');
    const PLAYER_2 = new Player('Player 2');
    GAME.setup(PLAYER_1, PLAYER_2);
    FUNCTIONS.card.importAll();
    GAME.doConfigAi();

    return { game: GAME, player1: PLAYER_1, player2: PLAYER_2 };
}

const ATTACK = {
    /**
     * Makes a minion or hero attack another minion or hero
     *
     * @param attacker attacker | Amount of damage to deal
     * @param target The target
     *
     * @returns Success | Errorcode
     */
    attack(attacker: Target | number | string, target: Target): GameAttackReturn {
        game.killMinions();

        let returnValue: GameAttackReturn;

        if (target instanceof Card && target.hasKeyword('Immune')) {
            return 'immune';
        }

        if (target instanceof Player && target.immune) {
            return 'immune';
        }

        // Attacker is a number
        if (typeof attacker === 'string' || typeof attacker === 'number') {
            returnValue = ATTACK._attackerIsNum(attacker, target);
            game.killMinions();
            return returnValue;
        }

        // The attacker is a card or player
        if (attacker instanceof Card && attacker.hasKeyword('Frozen')) {
            return 'frozen';
        }

        if (attacker instanceof Player && attacker.frozen) {
            return 'frozen';
        }

        // Check if there is a minion with taunt
        const TAUNTS = game.board[game.opponent.id].filter(m => m.hasKeyword('Taunt'));
        if (TAUNTS.length > 0) {
            // If the target is a card and has taunt, you are allowed to attack it
            if (target instanceof Card && target.hasKeyword('Taunt')) {
                // Allow the attack since the target also has taunt
            } else {
                return 'taunt';
            }
        }

        if (attacker instanceof Player) {
            // Attacker is a player
            returnValue = ATTACK._attackerIsPlayer(attacker, target);
        } else if (attacker instanceof Card) {
            // Attacker is a minion
            returnValue = ATTACK._attackerIsCard(attacker, target);
        } else {
            // Otherwise
            return 'invalid';
        }

        game.killMinions();
        return returnValue;
    },

    // Attacker is a number
    _attackerIsNum(attacker: number | string, target: Target): GameAttackReturn {
        // Attacker is a number
        // Spell damage
        const DAMAGE = ATTACK._spellDamage(attacker, target);

        if (target instanceof Player) {
            target.remHealth(DAMAGE);
            return true;
        }

        if (target.hasKeyword('Divine Shield')) {
            target.remKeyword('Divine Shield');
            return 'divineshield';
        }

        target.remStats(0, DAMAGE);

        // Remove frenzy
        ATTACK._doFrenzy(target);

        return true;
    },

    // Attacker is a player
    _attackerIsPlayer(attacker: Player, target: Target): GameAttackReturn {
        if (attacker.attack <= 0) {
            return 'plrnoattack';
        }

        if (!attacker.canAttack) {
            return 'plrhasattacked';
        }

        // Target is a player
        if (target instanceof Player) {
            return ATTACK._attackerIsPlayerAndTargetIsPlayer(attacker, target);
        }

        // Target is a card
        if (target instanceof Card) {
            return ATTACK._attackerIsPlayerAndTargetIsCard(attacker, target);
        }

        // Otherwise
        return 'invalid';
    },

    // Attacker is a player and target is a player
    _attackerIsPlayerAndTargetIsPlayer(attacker: Player, target: Player): GameAttackReturn {
        // Get the attacker's attack damage, and attack the target with it
        ATTACK.attack(attacker.attack, target);
        game.events.broadcast('Attack', [attacker, target], attacker);

        // The attacker can't attack anymore this turn.
        attacker.canAttack = false;
        ATTACK._removeDurabilityFromWeapon(attacker, target);

        return true;
    },

    // Attacker is a player and target is a card
    _attackerIsPlayerAndTargetIsCard(attacker: Player, target: Card): GameAttackReturn {
        // If the target has stealth, the attacker can't attack it
        if (target.hasKeyword('Stealth')) {
            return 'stealth';
        }

        // The attacker should damage the target
        game.attack(attacker.attack, target);
        game.attack(target.getAttack(), attacker);
        game.events.broadcast('Attack', [attacker, target], attacker);

        game.killMinions();

        // The attacker can't attack anymore this turn.
        attacker.canAttack = false;

        // Remove frenzy
        ATTACK._doFrenzy(target);

        game.killMinions();
        ATTACK._removeDurabilityFromWeapon(attacker, target);

        return true;
    },

    // Attacker is a card
    _attackerIsCard(attacker: Card, target: Target): GameAttackReturn {
        if (attacker instanceof Card && attacker.hasKeyword('Dormant')) {
            return 'dormant';
        }

        if (attacker.attackTimes && attacker.attackTimes <= 0) {
            return 'hasattacked';
        }

        if (attacker.sleepy) {
            return 'sleepy';
        }

        if (attacker.getAttack() <= 0) {
            return 'noattack';
        }

        // Target is a player
        if (target instanceof Player) {
            return ATTACK._attackerIsCardAndTargetIsPlayer(attacker, target);
        }

        // Target is a minion
        if (target instanceof Card) {
            return ATTACK._attackerIsCardAndTargetIsCard(attacker, target);
        }

        // Otherwise
        return 'invalid';
    },

    // Attacker is a card and target is a player
    _attackerIsCardAndTargetIsPlayer(attacker: Card, target: Player): GameAttackReturn {
        if (!attacker.canAttackHero) {
            return 'cantattackhero';
        }

        // If attacker has stealth, remove it
        if (attacker.hasKeyword('Stealth')) {
            attacker.remKeyword('Stealth');
        }

        // If attacker has lifesteal, heal it's owner
        ATTACK._doLifesteal(attacker);

        // Deal damage
        ATTACK.attack(attacker.getAttack(), target);

        // Remember this attack
        attacker.decAttack();
        game.events.broadcast('Attack', [attacker, target], attacker.plr);

        return true;
    },

    // Attacker is a card and target is a card
    _attackerIsCardAndTargetIsCard(attacker: Card, target: Card): GameAttackReturn {
        if (target.hasKeyword('Stealth')) {
            return 'stealth';
        }

        ATTACK._attackerIsCardAndTargetIsCardDoAttacker(attacker, target);
        ATTACK._attackerIsCardAndTargetIsCardDoTarget(attacker, target);

        game.events.broadcast('Attack', [attacker, target], attacker.plr);

        return true;
    },
    _attackerIsCardAndTargetIsCardDoAttacker(attacker: Card, target: Card): GameAttackReturn {
        // Cleave
        ATTACK._cleave(attacker, target);

        attacker.decAttack();
        attacker.remKeyword('Stealth');

        const SHOULD_DAMAGE = ATTACK._cardAttackHelper(attacker);
        if (!SHOULD_DAMAGE) {
            return true;
        }

        ATTACK.attack(target.getAttack(), attacker);

        // Remove frenzy
        ATTACK._doFrenzy(attacker);

        // If the target has poison, kill the attacker
        ATTACK._doPoison(target, attacker);

        return true;
    },
    _attackerIsCardAndTargetIsCardDoTarget(attacker: Card, target: Card): GameAttackReturn {
        const SHOULD_DAMAGE = ATTACK._cardAttackHelper(target);
        if (!SHOULD_DAMAGE) {
            return true;
        }

        ATTACK.attack(attacker.getAttack(), target);

        ATTACK._doLifesteal(attacker);
        ATTACK._doPoison(attacker, target);

        // Remove frenzy
        ATTACK._doFrenzy(target);
        if (target.getHealth() < 0) {
            attacker.activate('overkill');
        }

        if (target.getHealth() === 0) {
            attacker.activate('honorablekill');
        }

        return true;
    },

    // Helper functions
    _cardAttackHelper(card: Card): boolean {
        if (card.hasKeyword('Immune')) {
            return false;
        }

        if (card.hasKeyword('Divine Shield')) {
            card.remKeyword('Divine Shield');
            return false;
        }

        return true;
    },

    _cleave(attacker: Card, target: Card): void {
        if (!attacker.hasKeyword('Cleave')) {
            return;
        }

        const BOARD = game.board[target.plr.id];
        const INDEX = BOARD.indexOf(target);

        const BELOW = BOARD[INDEX - 1];
        const ABOVE = BOARD[INDEX + 1];

        // If there is a card below the target, also deal damage to it.
        if (BELOW) {
            game.attack(attacker.getAttack(), BELOW);
        }

        // If there is a card above the target, also deal damage to it.
        if (ABOVE) {
            game.attack(attacker.getAttack(), ABOVE);
        }
    },

    _doFrenzy(card: Card): void {
        if (card.getHealth() <= 0) {
            return;
        }

        // The card has more than 0 health
        if (card.activate('frenzy') !== -1) {
            card.abilities.frenzy = undefined;
        }
    },

    _doPoison(poisonCard: Card, other: Card): void {
        if (!poisonCard.hasKeyword('Poisonous')) {
            return;
        }

        // The attacker has poison
        other.kill();
    },

    _doLifesteal(attacker: Card): void {
        if (!attacker.hasKeyword('Lifesteal')) {
            return;
        }

        // The attacker has lifesteal
        attacker.plr.addHealth(attacker.getAttack());
    },

    _spellDamage(attacker: number | string, target: Target): number {
        if (typeof attacker !== 'string') {
            return attacker;
        }

        // The attacker is a string but not spelldamage syntax
        const SPELL_DAMAGE_REGEX = /\$(\d+?)/;
        const MATCH = SPELL_DAMAGE_REGEX.exec(attacker);

        if (!MATCH) {
            throw new TypeError('Non-spelldamage string passed into attack.');
        }

        let dmg = game.lodash.parseInt(MATCH[1]);
        dmg += game.player.spellDamage;

        game.events.broadcast('SpellDealsDamage', [target, dmg], game.player);
        return dmg;
    },

    _removeDurabilityFromWeapon(attacker: Player, target: Target): void {
        const WEAPON = attacker.weapon;
        if (!WEAPON) {
            return;
        }

        // If the weapon would be part of the attack, remove 1 durability
        if (WEAPON.attackTimes && WEAPON.attackTimes > 0 && WEAPON.getAttack()) {
            WEAPON.attackTimes -= 1;
            WEAPON.remStats(0, 1);

            if (target instanceof Card) {
                ATTACK._doPoison(WEAPON, target);
            }
        }

        game.killMinions();
    },
};

const PLAY_CARD = {
    /**
     * Play a card
     *
     * @param card The card to play
     * @param player The card's owner
     */
    play(card: Card, player: Player): GamePlayCardReturn {
        game.killMinions();

        // Forge
        const FORGE = PLAY_CARD._forge(card, player);
        if (FORGE !== 'invalid') {
            return FORGE;
        }

        // Trade
        const TRADE = PLAY_CARD._trade(card, player);
        if (TRADE !== 'invalid') {
            return TRADE;
        }

        // Cost
        if (player[card.costType] < card.cost) {
            return 'cost';
        }

        // Condition
        if (!PLAY_CARD._condition(card, player)) {
            return 'refund';
        }

        // Charge you for the card
        player[card.costType] -= card.cost;
        FUNCTIONS.util.remove(player.hand, card);

        // Counter
        if (PLAY_CARD._countered(card, player)) {
            return 'counter';
        }

        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (!PLAY_CARD._hasCapacity(card, player)) {
            return 'space';
        }

        // Broadcast `PlayCardUnsafe` event without adding it to the history
        game.events.broadcast('PlayCardUnsafe', card, player, false);

        // Finale
        if (player[card.costType] === 0) {
            card.activate('finale');
        }

        // Store the result of the type-specific code
        let result: GamePlayCardReturn = true;

        // Type specific code
        // HACK: Use of never
        const typeFunction: (card: Card, player: Player) => GamePlayCardReturn = PLAY_CARD.TYPE_SPECIFIC[card.type as never];
        if (!typeFunction) {
            throw new TypeError('Cannot handle playing card of type: ' + card.type);
        }

        result = typeFunction(card, player);

        // Refund
        if (result === 'refund') {
            return result;
        }

        // Add the `PlayCardUnsafe` event to the history, now that it's safe to do so
        game.events.addHistory('PlayCardUnsafe', card, player);

        // Echo
        PLAY_CARD._echo(card, player);

        // Combo
        PLAY_CARD._combo(card, player);

        // Broadcast `PlayCard` event
        game.events.broadcast('PlayCard', card, player);

        PLAY_CARD._corrupt(card, player);
        game.killMinions();

        return result;
    },

    // Card type specific code
    TYPE_SPECIFIC: {
        Minion(card: Card, player: Player): GamePlayCardReturn {
            // Magnetize
            if (PLAY_CARD._magnetize(card, player)) {
                return 'magnetize';
            }

            if (!card.hasKeyword('Dormant') && card.activate('battlecry') === -1) {
                return 'refund';
            }

            const unsuppress = FUNCTIONS.event.suppress('SummonMinion');
            const RETURN_VALUE = CARDS.summon(card, player);
            unsuppress();

            return RETURN_VALUE;
        },

        Spell(card: Card, player: Player): GamePlayCardReturn {
            if (card.activate('cast') === -1) {
                return 'refund';
            }

            // Twinspell functionality
            if (card.hasKeyword('Twinspell')) {
                card.remKeyword('Twinspell');
                card.text = card.text.split('Twinspell')[0].trim();

                player.addToHand(card);
            }

            // Spellburst functionality
            for (const CARD of game.board[player.id]) {
                CARD.activate('spellburst');
                CARD.abilities.spellburst = undefined;
            }

            return true;
        },

        Weapon(card: Card, player: Player): GamePlayCardReturn {
            if (card.activate('battlecry') === -1) {
                return 'refund';
            }

            player.setWeapon(card);
            return true;
        },

        Hero(card: Card, player: Player): GamePlayCardReturn {
            if (card.activate('battlecry') === -1) {
                return 'refund';
            }

            player.setHero(card, 5);
            return true;
        },

        Location(card: Card, player: Player): GamePlayCardReturn {
            card.setStats(0, card.getHealth());
            card.addKeyword('Immune');
            card.cooldown = 0;

            const unsuppress = FUNCTIONS.event.suppress('SummonMinion');
            const RETURN_VALUE = CARDS.summon(card, player);
            unsuppress();

            return RETURN_VALUE;
        },
    },

    _trade(card: Card, player: Player): GamePlayCardReturn {
        if (!card.hasKeyword('Tradeable')) {
            return 'invalid';
        }

        let q;

        if (player.ai) {
            q = player.ai.trade(card);
        } else {
            INTERACT.info.showGame(player);
            q = INTERACT.yesNoQuestion(player, 'Would you like to trade ' + card.colorFromRarity() + ' for a random card in your deck?');
        }

        if (!q) {
            return 'invalid';
        }

        if (player.mana < 1) {
            return 'cost';
        }

        if (player.hand.length >= CONFIG.general.maxHandLength) {
            return 'space';
        }

        if (player.deck.length <= 0) {
            return 'space';
        }

        player.mana -= 1;

        FUNCTIONS.util.remove(player.hand, card);
        player.drawCard();
        player.shuffleIntoDeck(card);

        game.events.broadcast('TradeCard', card, player);

        return true;
    },

    _forge(card: Card, player: Player): GamePlayCardReturn {
        const FORGE = card.getKeyword('Forge') as string | undefined;

        if (!FORGE) {
            return 'invalid';
        }

        let q;

        if (player.ai) {
            q = player.ai.forge(card);
        } else {
            INTERACT.info.showGame(player);
            q = INTERACT.yesNoQuestion(player, 'Would you like to forge ' + card.colorFromRarity() + '?');
        }

        if (!q) {
            return 'invalid';
        }

        if (player.mana < 2) {
            return 'cost';
        }

        player.mana -= 2;

        FUNCTIONS.util.remove(player.hand, card);
        const FORGED = new Card(FORGE, player);
        player.addToHand(FORGED);

        game.events.broadcast('ForgeCard', card, player);

        return true;
    },

    _hasCapacity(card: Card, player: Player): boolean {
        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (game.board[player.id].length < game.config.general.maxBoardSpace || !card.canBeOnBoard()) {
            return true;
        }

        // Refund
        const unsuppress = FUNCTIONS.event.suppress('AddCardToHand');
        player.addToHand(card);
        unsuppress();

        if (card.costType === 'mana') {
            player.refreshMana(card.cost);
        } else {
            player[card.costType] += card.cost;
        }

        return false;
    },

    _condition(card: Card, player: Player): boolean {
        const CONDITION = card.activate('condition');
        if (!(Array.isArray(CONDITION))) {
            return true;
        }

        // This is if the condition is cleared
        const CLEARED = CONDITION[0] as boolean;
        if (CLEARED) {
            return true;
        }

        // Warn the user that the condition is not fulfilled
        const WARN_MESSAGE = '<yellow>WARNING: This card\'s condition is not fulfilled. Are you sure you want to play this card?</yellow>';

        INTERACT.info.showGame(player);
        const WARN = INTERACT.yesNoQuestion(player, WARN_MESSAGE);

        if (!WARN) {
            return false;
        }

        return true;
    },

    _countered(card: Card, player: Player): boolean {
        const OPPONENT = player.getOpponent();

        // Check if the card is countered
        if (OPPONENT.counter && OPPONENT.counter.includes(card.type)) {
            FUNCTIONS.util.remove(OPPONENT.counter, card.type);
            return true;
        }

        return false;
    },

    _echo(card: Card, player: Player): boolean {
        if (!card.hasKeyword('Echo')) {
            return false;
        }

        // Create an exact copy of the card played
        const ECHO = card.perfectCopy();
        ECHO.addKeyword('Echo');

        player.addToHand(ECHO);
        return true;
    },

    _combo(card: Card, player: Player): boolean {
        if (!game.events.events.PlayCard) {
            return false;
        }

        // Get the player's PlayCard event history
        const STAT = game.events.events.PlayCard[player.id];
        if (STAT.length <= 0) {
            return false;
        }

        // Get the latest event
        const LATEST = game.lodash.last(STAT);
        const LATEST_CARD = LATEST?.[0] as Card;

        // If the previous card played was played on the same turn as this one, activate combo
        if (LATEST_CARD.turn === game.turns) {
            card.activate('combo');
        }

        return true;
    },

    _corrupt(card: Card, player: Player): boolean {
        for (const TO_CORRUPT of player.hand) {
            const CORRUPT = TO_CORRUPT.getKeyword('Corrupt') as string | undefined;
            if (!CORRUPT || card.cost <= TO_CORRUPT.cost) {
                continue;
            }

            // Corrupt that card
            const CORRUPTED = new Card(CORRUPT, player);

            FUNCTIONS.util.remove(player.hand, TO_CORRUPT);

            const unsuppress = FUNCTIONS.event.suppress('AddCardToHand');
            player.addToHand(CORRUPTED);
            unsuppress();
        }

        return true;
    },

    _magnetize(card: Card, player: Player): boolean {
        const BOARD = game.board[player.id];

        if (!card.hasKeyword('Magnetic') || BOARD.length <= 0) {
            return false;
        }

        // Find the mechs on the board
        const MECHS = BOARD.filter(m => m.tribe?.includes('Mech'));
        if (MECHS.length <= 0) {
            return false;
        }

        // I'm using while loops to prevent a million indents
        const MECH = INTERACT.selectCardTarget('Which minion do you want this card to Magnetize to:', undefined, 'friendly');
        if (!MECH) {
            return false;
        }

        if (!MECH.tribe?.includes('Mech')) {
            game.log('That minion is not a Mech.');
            return PLAY_CARD._magnetize(card, player);
        }

        MECH.addStats(card.getAttack(), card.getHealth());

        for (const KEY of Object.keys(card.keywords)) {
            MECH.addKeyword(KEY as CardKeyword);
        }

        if (MECH.maxHealth && card.maxHealth) {
            MECH.maxHealth += card.maxHealth;
        }

        // Transfer the abilities over.
        for (const ENTRY of Object.entries(card.abilities)) {
            const [KEY, VALUE] = ENTRY;

            for (const ability of VALUE) {
                MECH.addAbility(KEY as CardAbility, ability);
            }
        }

        // Echo
        PLAY_CARD._echo(card, player);

        // Corrupt
        PLAY_CARD._corrupt(card, player);

        return true;
    },
};

const CARDS = {
    play: PLAY_CARD,

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
    summon(minion: Card, player: Player, colossal = true): true | 'space' | 'colossal' | 'invalid' {
        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (game.board[player.id].length >= game.config.general.maxBoardSpace) {
            return 'space';
        }

        game.events.broadcast('SummonMinion', minion, player);

        player.spellDamage = 0;

        if (minion.hasKeyword('Charge')) {
            minion.sleepy = false;
        }

        if (minion.hasKeyword('Rush')) {
            minion.sleepy = false;
            minion.canAttackHero = false;
        }

        const DORMANT = minion.getKeyword('Dormant') as number | undefined;

        const COLOSSAL_MINIONS = minion.getKeyword('Colossal') as string[] | undefined;
        if (COLOSSAL_MINIONS && colossal) {
            // Minion.colossal is a string array.
            // example: ["Left Arm", "", "Right Arm"]
            // the "" gets replaced with the main minion

            for (const CARD_NAME of COLOSSAL_MINIONS) {
                const unsuppress = FUNCTIONS.event.suppress('SummonMinion');

                if (CARD_NAME === '') {
                    game.summonMinion(minion, player, false);
                    unsuppress();
                    continue;
                }

                const CARD = new Card(CARD_NAME, player);

                if (DORMANT) {
                    CARD.addKeyword('Dormant', DORMANT);
                }

                game.summonMinion(CARD, player);
                unsuppress();
            }

            return 'colossal';
        }

        if (DORMANT) {
            // Oh no... Why is this not documented?
            minion.setKeyword('Dormant', DORMANT + game.turns);
            minion.addKeyword('Immune');
            minion.sleepy = false;
        }

        game.board[player.id].push(minion);

        for (const CARD of game.board[player.id]) {
            for (const KEY of Object.keys(CARD.keywords)) {
                if (KEY.startsWith('Spell Damage +')) {
                    player.spellDamage += game.lodash.parseInt(KEY.split('+')[1]);
                }
            }
        }

        return true;
    },
};
