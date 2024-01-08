/**
 * Game
 * @module Game
 */
import _ from 'lodash';
import { Player, Card, Ai, functions, interact, eventManager } from '../internal.js';
import { type Blueprint, type CardAbility, type CardKeyword, type EventKey, type GameAttackReturn, type GameConstants, type GamePlayCardReturn, type Target, type UnknownEventValue } from '../types.js';
import { config } from '../../config.js';
import { cardIds } from '../../cards/ids.js';

const cardCollections = {
    lackeys: [24, 25, 26, 27, 28],
    totems: [15, 16, 17, 18],
    classes: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
};

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
     * Event & History managment and tracker.
     */
    event = eventManager;

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
     * Use `functions.card.getAll()` instead.
     */
    blueprints: Blueprint[] = [];

    /**
     * All of the cards that have been implemented so far.
     *
     * Use `functions.card.getAll()` instead.
     */
    cards: Card[] = [];

    play = cards.play.play;
    summon = cards.summon;

    attack = attack.attack;

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
    turn = 0;

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
     * If this is true, the game will not accept input from the user, and so the user can't interact with the game. This will most likely cause an infinite loop, unless both players are ai's.
     */
    noInput = false;

    /**
     * If this is true, the game will not output anything to the console.
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

    debugLog: any[] = [];

    cardCollections = cardCollections;
    lodash = _;
    cardIds = cardIds;

    constructor() {
        globalThis.game = this;
    }

    /**
     * Sets up the game by assigning players and initializing game state.
     *
     * @param player1 The first player.
     * @param player2 The second player.
     */
    setup(player1: Player, player2: Player): void {
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
            refund: -1,
        };
    }

    /**
     * Ask the user a question and returns their answer
     *
     * @param prompt The question to ask
     * @param care If this is false, it overrides `game.noInput`. Only use this when debugging.
     *
     * @returns What the user answered
     */
    input(prompt = '', overrideNoInput = false, useInputQueue = true): string {
        return this.interact.gameLoop.input(prompt, overrideNoInput, useInputQueue);
    }

    /**
     * Pause the game until the user presses the enter key.
     * Use this instead of `input` if you don't care about the return value for clarity.
     *
     * @param [prompt="Press enter to continue..."] The prompt to show the user
     */
    pause(prompt = 'Press enter to continue...'): void {
        this.interact.gameLoop.input(prompt);
    }

    /**
     * Wrapper for console.log
     */
    log(...data: any): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.interact.gameLoop.log(...data);
    }

    /**
     * Wrapper for console.error
     */
    logError(...data: any): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.interact.gameLoop.logError(...data);
    }

    /**
     * Wrapper for console.warn
     */
    logWarn(...data: any): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.interact.gameLoop.logWarn(...data);
    }

    /**
     * Saves debug information to be used in log files.
     *
     * @param data The data to be saved.
     */
    logDebug(...data: any): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
        for (const player of [this.player1, this.player2]) {
            // HACK: Use of never. Might not update correctly if the config format is changed
            if (!this.config.ai['player' + (player.id + 1) as never]) {
                player.ai = undefined;
                continue;
            }

            if (!player.ai) {
                player.ai = new Ai(player);
            }
        }

        return true;
    }

    /**
     * Broadcast event to event listeners
     *
     * @param key The name of the event (see `EventKey`)
     * @param value The value of the event
     *
     * @returns Return values of all the executed functions
     */
    triggerEventListeners(key: EventKey, value: UnknownEventValue, player: Player): void {
        for (const eventListener of Object.values(this.event.listeners)) {
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
        const players = [];

        // Make players draw cards
        for (let i = 0; i < 2; i++) {
            // Set the player's hero to the default hero for the class
            const player = this.functions.util.getPlayerFromId(i);

            const success = player.setToStartingHero();
            if (!success) {
                throw new Error('File \'cards/StartingHeroes/' + player.heroClass.toLowerCase().replaceAll(' ', '_') + '.ts\' is either; Missing or Incorrect. Please copy the working \'cards/StartingHeroes/\' folder from the github repo to restore a working copy. Error Code: 12');
            }

            // Add quest cards to the players hands
            for (const card of player.deck) {
                if (!card.text.includes('Quest: ') && !card.text.includes('Questline: ')) {
                    continue;
                }

                const unsuppress = this.functions.event.suppress('AddCardToHand');
                player.addToHand(card);
                unsuppress();

                player.deck.splice(player.deck.indexOf(card), 1);
            }

            // Draw 3-4 cards
            const amountOfCards = (player.id === 0) ? 3 : 4;
            while (player.hand.length < amountOfCards) {
                const unsuppress = this.functions.event.suppress('DrawCard');
                player.drawCard();
                unsuppress();
            }

            for (const card of player.deck) {
                card.activate('startofgame');
            }

            for (const card of player.hand) {
                card.activate('startofgame');
            }

            players.push(player);
        }

        this.player1 = players[0];
        this.player2 = players[1];

        /*
         * Set the starting mana for the first player.
         * The second player will get this when their turn starts
         */
        this.player1.emptyMana = 1;
        this.player1.mana = 1;

        // Give the coin to the second player
        const coin = new Card(this.cardIds.theCoin2, this.player2);
        this.functions.event.withSuppressed('AddCardToHand', () => this.player2.addToHand(coin));

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
    endGame(winner: Player): boolean {
        if (!winner) {
            return false;
        }

        this.interact.info.watermark();
        console.log();

        // Do this to bypass 'Press enter to continue' prompt when showing history
        const history = this.interact.gameLoop.handleCmds('history', { echo: false });
        console.log(history);

        this.input(`Player ${winner.name} wins!\n`);

        this.running = false;

        // Create log file
        this.functions.util.createLogFile();

        return true;
    }

    /**
     * Ends the players turn and starts the opponents turn
     *
     * @returns Success
     */
    endTurn(): boolean {
        // Everything after this comment happens when the player's turn ends
        const { player, opponent } = this;
        this.event.broadcast('EndTurn', this.turn, player);

        // Ready the minions for the next turn.
        for (const card of player.getBoard()) {
            card.ready();
            card.resetAttackTimes();
        }

        // Trigger unspent mana
        if (player.mana > 0) {
            this.event.broadcast('UnspentMana', player.mana, player);
        }

        // Remove echo cards
        player.hand = player.hand.filter(c => !c.hasKeyword('Echo'));
        player.canAttack = true;

        // Everything after this comment happens when the opponent's turn starts
        this.turn++;

        // Mana stuff
        opponent.addEmptyMana(1);
        opponent.mana = opponent.emptyMana - opponent.overload;
        opponent.overload = 0;
        opponent.attack = 0;

        // Weapon stuff
        if (opponent.weapon && opponent.weapon.attack! > 0) {
            opponent.attack = opponent.weapon.attack!;
            opponent.weapon.resetAttackTimes();
        }

        // Chance to spawn in a diy card
        if (this.lodash.random(0, 1, true) <= config.advanced.diyCardSpawnChance && config.advanced.spawnInDiyCards) {
            this.interact.card.spawnInDiyCard(opponent);
        }

        // Minion start of turn
        for (const card of opponent.getBoard()) {
            // Dormant
            const dormant = card.getKeyword('Dormant') as number | undefined;

            if (dormant) {
                // If the current turn is less than the dormant value, do nothing
                if (this.turn <= dormant) {
                    continue;
                }

                // Remove dormant
                card.remKeyword('Dormant');
                card.sleepy = true;

                if (Object.keys(card.backups.init.keywords).includes('Immune')) {
                    card.addKeyword('Immune');
                }

                /*
                 * Set the card's turn to this turn.
                 * TODO: Should this happen?
                 */
                card.turn = this.turn;

                // HACK: If the battlecry use a function that depends on `game.player`
                this.player = opponent;
                card.activate('battlecry');
                this.player = player;

                continue;
            }

            card.canAttackHero = true;
            card.remKeyword('Frozen');

            card.ready();
            card.resetAttackTimes();

            // Stealth duration
            if (card.stealthDuration && card.stealthDuration > 0 && this.turn > card.stealthDuration) {
                card.stealthDuration = 0;
                card.remKeyword('Stealth');
            }

            // Location cooldown
            if (card.type === 'Location' && card.cooldown && card.cooldown > 0) {
                card.cooldown--;
            }
        }

        // Draw card
        opponent.drawCard();

        opponent.canUseHeroPower = true;

        this.event.broadcast('StartTurn', this.turn, opponent);

        this.player = opponent;
        this.opponent = player;

        return true;
    }

    // Interacting with minions

    /**
     * Kill all minions with 0 or less health
     *
     * @returns The amount of minions killed
     */
    killCardsOnBoard(): number {
        let amount = 0;

        for (let p = 0; p < 2; p++) {
            const player = this.functions.util.getPlayerFromId(p);

            /*
             * The minions with more than 0 health will be added to this list.
             * The player's side of the board will be set to this list at the end.
             * This will effectively remove all minions with 0 or less health from the board
             */
            const spared: Card[] = [];
            const shouldSpare = (card: Card) => (card.health ?? 0) > 0 || ((card.durability ?? 0) > 0);

            // Trigger the deathrattles before doing the actual killing so the deathrattles can save the card by setting it's health to above 0
            for (const card of this.board[p]) {
                if (shouldSpare(card)) {
                    continue;
                }

                card.activate('deathrattle');
            }

            for (const card of this.board[p]) {
                // Add minions with more than 0 health to `spared`.
                if (shouldSpare(card)) {
                    spared.push(card);
                    continue;
                }

                // Calmly tell the minion that it is going to die
                card.activate('remove');

                this.event.broadcast('KillCard', card, this.player);

                card.turnKilled = this.turn;
                amount++;

                player.corpses++;
                this.graveyard[p].push(card);

                if (!card.hasKeyword('Reborn')) {
                    continue;
                }

                // Reborn
                const minion = card.imperfectCopy();
                minion.remKeyword('Reborn');

                // Reduce the minion's health to 1, keep the minion's attack the same
                minion.setStats(minion.attack, 1);

                /*
                 * Suppress the event here since we activate some abilities on the minion further up.
                 * This isn't great performance wise, but there's not much we can do about it.
                 * Although the performance hit is only a few milliseconds in total every time (This function does get called often), so there's bigger performance gains to be had elsewhere.
                 */
                this.functions.event.withSuppressed('SummonCard', () => this.summon(minion, player));

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
                minion.activate('passive', 'reborn', card, this.player);

                spared.push(minion);
            }

            this.board[p] = spared;
        }

        return amount;
    }

    /**
     * Creates a card from the blueprint of an id.
     *
     * @param id The id of the blueprint. Use `game.cardIds`
     * @param owner The owner of the card
     *
     * @returns The card
     */
    createCard(id: number, owner: Player): Card {
        return new Card(id, owner);
    }
}

/**
 * Creates a new game instance, initializes players, sets up the game, imports all cards, and configures AI.
 *
 * @return An object containing the game instance, player 1, and player 2.
 */
export function createGame() {
    const game = new Game();
    const player1 = new Player('Player 1');
    const player2 = new Player('Player 2');
    game.setup(player1, player2);
    game.functions.card.importAll();
    game.doConfigAi();

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
        let returnValue: GameAttackReturn;

        if (target instanceof Card && target.hasKeyword('Immune')) {
            return 'immune';
        }

        if (target instanceof Player && target.immune) {
            return 'immune';
        }

        // Attacker is a number
        if (typeof attacker === 'string' || typeof attacker === 'number') {
            return attack._attackerIsNum(attacker, target);
        }

        // The attacker is a card or player
        if (attacker instanceof Card && attacker.hasKeyword('Frozen')) {
            return 'frozen';
        }

        if (attacker instanceof Player && attacker.frozen) {
            return 'frozen';
        }

        // Check if there is a minion with taunt
        const taunts = game.opponent.getBoard().filter(m => m.hasKeyword('Taunt'));
        if (taunts.length > 0) {
            // If the target is a card and has taunt, you are allowed to attack it
            if (target instanceof Card && target.hasKeyword('Taunt')) {
                // Allow the attack since the target also has taunt
            } else {
                return 'taunt';
            }
        }

        if (attacker instanceof Player) {
            // Attacker is a player
            returnValue = attack._attackerIsPlayer(attacker, target);
        } else if (attacker instanceof Card) {
            // Attacker is a minion
            returnValue = attack._attackerIsCard(attacker, target);
        } else {
            // Otherwise
            return 'invalid';
        }

        return returnValue;
    },

    // Attacker is a number
    _attackerIsNum(attacker: number | string, target: Target): GameAttackReturn {
        /*
         * Attacker is a number
         * Spell damage
         */
        const damage = attack._spellDamage(attacker, target);

        if (target instanceof Player) {
            target.remHealth(damage);
            return true;
        }

        if (target.hasKeyword('Divine Shield')) {
            target.remKeyword('Divine Shield');
            return 'divineshield';
        }

        target.remStats(0, damage);

        // Remove frenzy
        attack._doFrenzy(target);

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
            return attack._attackerIsPlayerAndTargetIsPlayer(attacker, target);
        }

        // Target is a card
        if (target instanceof Card) {
            return attack._attackerIsPlayerAndTargetIsCard(attacker, target);
        }

        // Otherwise
        return 'invalid';
    },

    // Attacker is a player and target is a player
    _attackerIsPlayerAndTargetIsPlayer(attacker: Player, target: Player): GameAttackReturn {
        // Get the attacker's attack damage, and attack the target with it
        attack.attack(attacker.attack, target);
        game.event.broadcast('Attack', [attacker, target], attacker);

        // The attacker can't attack anymore this turn.
        attacker.canAttack = false;
        attack._removeDurabilityFromWeapon(attacker, target);

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
        game.attack(target.attack!, attacker);
        game.event.broadcast('Attack', [attacker, target], attacker);

        // The attacker can't attack anymore this turn.
        attacker.canAttack = false;

        // Remove frenzy
        attack._doFrenzy(target);
        attack._removeDurabilityFromWeapon(attacker, target);

        return true;
    },

    // Attacker is a card
    _attackerIsCard(attacker: Card, target: Target): GameAttackReturn {
        if (attacker.hasKeyword('Dormant')) {
            return 'dormant';
        }

        if (attacker.hasKeyword('Titan')) {
            return 'titan';
        }

        if (attacker.attackTimes && attacker.attackTimes <= 0) {
            return 'hasattacked';
        }

        if (attacker.sleepy) {
            return 'sleepy';
        }

        if (attacker.attack! <= 0) {
            return 'noattack';
        }

        // Target is a player
        if (target instanceof Player) {
            return attack._attackerIsCardAndTargetIsPlayer(attacker, target);
        }

        // Target is a minion
        if (target instanceof Card) {
            return attack._attackerIsCardAndTargetIsCard(attacker, target);
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
        attack._doLifesteal(attacker);

        // Deal damage
        attack.attack(attacker.attack!, target);

        // Remember this attack
        attacker.decAttack();
        game.event.broadcast('Attack', [attacker, target], attacker.plr);

        return true;
    },

    // Attacker is a card and target is a card
    _attackerIsCardAndTargetIsCard(attacker: Card, target: Card): GameAttackReturn {
        if (target.hasKeyword('Stealth')) {
            return 'stealth';
        }

        attack._attackerIsCardAndTargetIsCardDoAttacker(attacker, target);
        attack._attackerIsCardAndTargetIsCardDoTarget(attacker, target);

        game.event.broadcast('Attack', [attacker, target], attacker.plr);

        return true;
    },
    _attackerIsCardAndTargetIsCardDoAttacker(attacker: Card, target: Card): GameAttackReturn {
        // Cleave
        attack._cleave(attacker, target);

        attacker.decAttack();
        attacker.remKeyword('Stealth');

        const shouldDamage = attack._cardAttackHelper(attacker);
        if (!shouldDamage) {
            return true;
        }

        attack.attack(target.attack!, attacker);

        // Remove frenzy
        attack._doFrenzy(attacker);

        // If the target has poison, kill the attacker
        attack._doPoison(target, attacker);

        return true;
    },
    _attackerIsCardAndTargetIsCardDoTarget(attacker: Card, target: Card): GameAttackReturn {
        const shouldDamage = attack._cardAttackHelper(target);
        if (!shouldDamage) {
            return true;
        }

        attack.attack(attacker.attack!, target);

        attack._doLifesteal(attacker);
        attack._doPoison(attacker, target);

        // Remove frenzy
        attack._doFrenzy(target);
        if (target.health! < 0) {
            attacker.activate('overkill');
        }

        if (target.health! === 0) {
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

        const board = target.plr.getBoard();
        const index = board.indexOf(target);

        const below = board[index - 1];
        const above = board[index + 1];

        // If there is a card below the target, also deal damage to it.
        if (below) {
            game.attack(attacker.attack!, below);
        }

        // If there is a card above the target, also deal damage to it.
        if (above) {
            game.attack(attacker.attack!, above);
        }
    },

    _doFrenzy(card: Card): void {
        if (card.health! <= 0) {
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
        attacker.plr.addHealth(attacker.attack!);
    },

    _spellDamage(attacker: number | string, target: Target): number {
        if (typeof attacker !== 'string') {
            return attacker;
        }

        // The attacker is a string but not spelldamage syntax
        const spellDamageRegex = /\$(\d+)/;
        const match = spellDamageRegex.exec(attacker);

        if (!match) {
            throw new TypeError('Non-spelldamage string passed into attack.');
        }

        let dmg = game.lodash.parseInt(match[1]);
        dmg += game.player.spellDamage;

        game.event.broadcast('SpellDealsDamage', [target, dmg], game.player);
        return dmg;
    },

    _removeDurabilityFromWeapon(attacker: Player, target: Target): void {
        const { weapon } = attacker;
        if (!weapon) {
            return;
        }

        // If the weapon would be part of the attack, remove 1 durability
        if (weapon.attackTimes && weapon.attackTimes > 0 && weapon.attack) {
            weapon.attackTimes -= 1;
            weapon.remStats(0, 1);

            if (target instanceof Card) {
                attack._doPoison(weapon, target);
            }
        }
    },
};

const playCard = {
    /**
     * Play a card
     *
     * @param card The card to play
     * @param player The card's owner
     */
    play(card: Card, player: Player): GamePlayCardReturn {
        // Forge
        const forge = playCard._forge(card, player);
        if (forge !== 'invalid') {
            return forge;
        }

        // Trade
        const trade = playCard._trade(card, player);
        if (trade !== 'invalid') {
            return trade;
        }

        // Cost
        if (player[card.costType] < card.cost) {
            return 'cost';
        }

        // Condition
        if (!playCard._condition(card, player)) {
            return 'refund';
        }

        // Charge you for the card
        player[card.costType] -= card.cost;
        game.functions.util.remove(player.hand, card);

        // Counter
        if (playCard._countered(card, player)) {
            return 'counter';
        }

        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (!playCard._hasCapacity(card, player)) {
            return 'space';
        }

        // Broadcast `PlayCardUnsafe` event without adding it to the history
        game.event.broadcast('PlayCardUnsafe', card, player, false);

        // Finale
        if (player[card.costType] === 0) {
            card.activate('finale');
        }

        // Store the result of the type-specific code
        let result: GamePlayCardReturn = true;

        /*
         * Type specific code
         * HACK: Use of never
         */
        const typeFunction: (card: Card, player: Player) => GamePlayCardReturn = playCard.typeSpecific[card.type as never];
        if (!typeFunction) {
            throw new TypeError('Cannot handle playing card of type: ' + card.type);
        }

        result = typeFunction(card, player);

        // Refund
        if (result === 'refund') {
            return result;
        }

        // Add the `PlayCardUnsafe` event to the history, now that it's safe to do so
        game.event.addHistory('PlayCardUnsafe', card, player);

        // Echo
        playCard._echo(card, player);

        // Combo
        playCard._combo(card, player);

        // Broadcast `PlayCard` event
        game.event.broadcast('PlayCard', card, player);

        playCard._corrupt(card, player);
        return result;
    },

    // Card type specific code
    typeSpecific: {
        Minion(card: Card, player: Player): GamePlayCardReturn {
            // Magnetize
            if (playCard._magnetize(card, player)) {
                return 'magnetize';
            }

            if (!card.hasKeyword('Dormant') && card.activate('battlecry') === -1) {
                return 'refund';
            }

            return game.functions.event.withSuppressed('SummonCard', () => player.summon(card));
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
            for (const card of player.getBoard()) {
                card.activate('spellburst');
                card.abilities.spellburst = undefined;
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

            player.setHero(card);
            return true;
        },

        Location(card: Card, player: Player): GamePlayCardReturn {
            card.setStats(0, card.health);
            card.addKeyword('Immune');
            card.cooldown = 0;

            return game.functions.event.withSuppressed('SummonCard', () => player.summon(card));
        },

        Heropower(card: Card, player: Player): GamePlayCardReturn {
            // A hero power card shouldn't really be played, but oh well.
            player.hero.heropowerId = card.id;
            player.hero.heropower = card;

            return true;
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
            game.interact.info.showGame(player);
            q = game.interact.yesNoQuestion('Would you like to trade ' + card.colorFromRarity() + ' for a random card in your deck?', player);
        }

        if (!q) {
            return 'invalid';
        }

        if (player.mana < 1) {
            return 'cost';
        }

        if (player.hand.length >= config.general.maxHandLength) {
            return 'space';
        }

        if (player.deck.length <= 0) {
            return 'space';
        }

        player.mana -= 1;

        game.functions.util.remove(player.hand, card);
        player.drawCard();
        player.shuffleIntoDeck(card);

        game.event.broadcast('TradeCard', card, player);

        return true;
    },

    _forge(card: Card, player: Player): GamePlayCardReturn {
        const forgeId = card.getKeyword('Forge') as number | undefined;

        if (!forgeId) {
            return 'invalid';
        }

        let q;

        if (player.ai) {
            q = player.ai.forge(card);
        } else {
            game.interact.info.showGame(player);
            q = game.interact.yesNoQuestion('Would you like to forge ' + card.colorFromRarity() + '?', player);
        }

        if (!q) {
            return 'invalid';
        }

        if (player.mana < 2) {
            return 'cost';
        }

        player.mana -= 2;

        game.functions.util.remove(player.hand, card);
        const forged = new Card(forgeId, player);
        player.addToHand(forged);

        game.event.broadcast('ForgeCard', card, player);

        return true;
    },

    _hasCapacity(card: Card, player: Player): boolean {
        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (player.getBoard().length < game.config.general.maxBoardSpace || !card.canBeOnBoard()) {
            return true;
        }

        // Refund
        game.functions.event.withSuppressed('AddCardToHand', () => player.addToHand(card));

        if (card.costType === 'mana') {
            player.refreshMana(card.cost);
        } else {
            player[card.costType] += card.cost;
        }

        return false;
    },

    _condition(card: Card, player: Player): boolean {
        const condition = card.activate('condition');
        if (!(Array.isArray(condition))) {
            return true;
        }

        // This is if the condition is cleared
        const cleared = condition[0] as boolean;
        if (cleared) {
            return true;
        }

        // Warn the user that the condition is not fulfilled
        const warnMessage = '<yellow>WARNING: This card\'s condition is not fulfilled. Are you sure you want to play this card?</yellow>';

        game.interact.info.showGame(player);
        const warn = game.interact.yesNoQuestion(warnMessage, player);

        if (!warn) {
            return false;
        }

        return true;
    },

    _countered(card: Card, player: Player): boolean {
        const opponent = player.getOpponent();

        // Check if the card is countered
        if (opponent.counter && opponent.counter.includes(card.type)) {
            game.functions.util.remove(opponent.counter, card.type);
            return true;
        }

        return false;
    },

    _echo(card: Card, player: Player): boolean {
        if (!card.hasKeyword('Echo')) {
            return false;
        }

        // Create an exact copy of the card played
        const echo = card.perfectCopy();
        echo.addKeyword('Echo');

        player.addToHand(echo);
        return true;
    },

    _combo(card: Card, player: Player): boolean {
        if (!game.event.events.PlayCard) {
            return false;
        }

        // Get the player's PlayCard event history
        const stat = game.event.events.PlayCard[player.id];
        if (stat.length <= 0) {
            return false;
        }

        // Get the latest event
        const latest = game.lodash.last(stat);
        const latestCard = latest?.[0] as Card;

        // If the previous card played was played on the same turn as this one, activate combo
        if (latestCard.turn === game.turn) {
            card.activate('combo');
        }

        return true;
    },

    _corrupt(card: Card, player: Player): boolean {
        for (const toCorrupt of player.hand) {
            const corruptId = toCorrupt.getKeyword('Corrupt') as number | undefined;
            if (!corruptId || card.cost <= toCorrupt.cost) {
                continue;
            }

            // Corrupt that card
            const corrupted = new Card(corruptId, player);

            game.functions.util.remove(player.hand, toCorrupt);
            game.functions.event.withSuppressed('AddCardToHand', () => player.addToHand(corrupted));
        }

        return true;
    },

    _magnetize(card: Card, player: Player): boolean {
        const board = player.getBoard();

        if (!card.hasKeyword('Magnetic') || board.length <= 0) {
            return false;
        }

        // Find the mechs on the board
        const mechs = board.filter(m => m.tribe?.includes('Mech'));
        if (mechs.length <= 0) {
            return false;
        }

        // I'm using while loops to prevent a million indents
        const mech = game.interact.selectCardTarget('Which minion do you want this card to Magnetize to:', undefined, 'friendly');
        if (!mech) {
            return false;
        }

        if (!mech.tribe?.includes('Mech')) {
            console.log('That minion is not a Mech.');
            return playCard._magnetize(card, player);
        }

        mech.addStats(card.attack, card.health);

        for (const entry of Object.entries(card.keywords)) {
            mech.addKeyword(entry[0] as CardKeyword, entry[1]);
        }

        if (mech.maxHealth && card.maxHealth) {
            mech.maxHealth += card.maxHealth;
        }

        // Transfer the abilities over.
        for (const entry of Object.entries(card.abilities)) {
            const [key, value] = entry;

            for (const ability of value) {
                mech.addAbility(key as CardAbility, ability);
            }
        }

        // Echo
        playCard._echo(card, player);

        // Corrupt
        playCard._corrupt(card, player);

        return true;
    },
};

const cards = {
    play: playCard,

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
    summon(card: Card, player: Player, colossal = true): true | 'space' | 'colossal' | 'invalid' {
        if (!card.canBeOnBoard()) {
            return 'invalid';
        }

        // If the board has max capacity, and the card played is a minion or location card, prevent it.
        if (player.getBoard().length >= game.config.general.maxBoardSpace) {
            return 'space';
        }

        game.event.broadcast('SummonCard', card, player);

        player.spellDamage = 0;

        if (card.hasKeyword('Charge') || card.hasKeyword('Titan')) {
            card.ready();
            card.resetAttackTimes();
        }

        if (card.hasKeyword('Rush')) {
            card.ready();
            card.resetAttackTimes();
            card.canAttackHero = false;
        }

        const dormant = card.getKeyword('Dormant') as number | undefined;

        const colossalMinionIds = card.getKeyword('Colossal') as number[] | undefined;
        if (colossalMinionIds && colossal) {
            /*
             * Minion.colossal is an id array.
             * example: [game.cardIds.leftArm36, game.cardIds.null0, game.cardIds.rightArm37]
             * the null0 / 0 gets replaced with the main minion
             */

            const unsuppress = game.functions.event.suppress('SummonCard');

            for (const cardId of colossalMinionIds) {
                if (cardId <= 0) {
                    // Summon this minion without triggering colossal again
                    player.summon(card, false);
                    continue;
                }

                const cardToSummon = new Card(cardId, player);

                // If this card has dormant, add it to the summoned minions as well.
                if (dormant) {
                    cardToSummon.addKeyword('Dormant', dormant);
                }

                player.summon(cardToSummon);
            }

            unsuppress();

            /*
             * Return since we already handled the main minion up in the "cardId <= 0" if statement
             * You should probably just ignore this error code
             */
            return 'colossal';
        }

        if (dormant) {
            /*
             * Oh no... Why is this not documented?
             *
             * If the minion that got summoned has dormant, it sets the dormant value to itself plus the current turn.
             * This is so that the game can know when to remove the dormant by checking which turn it is.
             * We should really document this somewhere, since it can easily be overriden by a card after it has been summoned, which would cause unexpected behavior.
             */
            card.setKeyword('Dormant', dormant + game.turn);
            card.addKeyword('Immune');

            // TODO: Why are we readying the dormant minion?
            card.ready();
            card.resetAttackTimes();
        }

        game.board[player.id].push(card);

        // Calculate new spell damage
        for (const card of player.getBoard()) {
            if (card.spellDamage) {
                player.spellDamage += card.spellDamage;
            }
        }

        return true;
    },
};
