const { Card } = require("./card");
const { Game } = require("./game");
const { Player } = require("./player");
const { get, set } = require("./shared");
const lodash = require("lodash");

/**
 * @type {Game}
 */
let game = get();

class SimulationAI {
    /**
     * @param {Player} plr 
     */
    constructor(plr) {
        game = get();

        /**
         * @type {[[string, any]]}
         */
        this.history = [];

        /**
         * @type {Card | null}
         */
        this.focus = null;

        /**
         * @type {boolean}
         */
        this.canAttack = true;

        /**
         * @type {Card | null}
         */
        this.on_card = null;

        /**
         * @type {SentimentAI}
         */
        this.backup_ai = new SentimentAI(plr);

        /**
         * @type {Player}
         */
        this.plr = plr;
    }

    /**
     * Calculate the best move and return the result
     * 
     * @returns {Card | string} Result
     */
    chooseMove() {
        // Makes a move in the simulation

        /**
         * @type {[Card | string, number]}
         */
        let best_move = [];

        this.plr.hand.forEach(card => {
            let simulation = this._createSimulation();

            let index = this.plr.hand.indexOf(card);
            if (index === -1) return false;
            index += 1

            // Play card
            this.on_card = card;
            let result = simulation.interact.doTurnLogic(index.toString());
            this.on_card = null;

            if (result !== true && !result instanceof Card || typeof result === "string") return; // Invalid move

            let score = this._evaluate(simulation);

            if (score <= best_move[1]) return;

            // This card is now the best move
            best_move = [card, score];
        });

        this._restoreGame();

        let score = best_move[1];
        best_move = best_move[0];

        if (!best_move) {
            // Couldn't play any cards
            if (this.canAttack) best_move = "attack";

            // TODO: Add hero power
            // TODO: Add use locations

            else best_move = "end";

            this.history.push(["chooseMove", best_move]);
        } else {
            this.history.push(["chooseMove", [best_move.name, score]]);

            best_move = this.plr.hand.indexOf(best_move) + 1;
        }

        if (best_move == "end") {
            this.canAttack = true;
        }

        return best_move;
    }

    /**
     * 
     * @param {Card | Player} attacker 
     * @param {Card | Player} target 
     * @param {[Card | Player, Card | Player, number]} best_attack 
     * @param {Game} simulation
     * 
     * @returns {[Card | Player, Card | Player, number]}
     */
    _attackTarget(attacker, target, best_attack, simulation) {
        let health = target.getHealth();
        let abck, tbck;

        if (attacker.classType == "Card") abck = attacker.createBackup();
        if (target.classType == "Card") tbck = target.createBackup();
        
        let result = simulation.attack(attacker, target);
        if (result !== true) return best_attack; // Invalid attack

        let score = this._evaluate(simulation);

        if (attacker.classType == "Card") {
            attacker.restoreBackup(attacker.backups[abck]);
            attacker.ready();
        }

        if (target.classType == "Card") target.restoreBackup(target.backups[tbck]);
        else target.health = health;

        if (score <= best_attack[2]) return best_attack;

        return [attacker, target, score];
    }

    /**
     * Makes the ai attack
     *
     * @returns {[Card | Player | -1 | null, Card | Player | -1 | null]} Attacker, Target
     */
    attack() {
        // FIXME: The ai doesn't attack.
        let simulation = this._createSimulation();

        let board = game.board;
        let thisboard = board[this.plr.id];
        let opboard = board[this.plr.getOpponent().id];

        /**
         * @type {[Card | Player, Card | Player, number]}
         */
        let best_attack = [];

        [...thisboard, this.plr].forEach(attacker => {
            if (attacker.attackTimes <= 0 || attacker.sleepy || attacker.dormant || attacker.attack || (attacker.getAttack && !attacker.getAttack())) return;

            // Attack a taunt if it exists
            let taunts = opboard.filter(c => c.keywords.includes("Taunt"));
            if (taunts.length > 0) {
                let target = taunts[0];
                best_attack = this._attackTarget(attacker, target, best_attack, simulation);
                return;
            }

            [...opboard, this.plr.getOpponent()].forEach(target => {
                if (attacker.classType == "Card" && !attacker.canAttackHero && target.classType == "Player") return;
                if (target.classType == "Card" && target.keywords.includes("Stealth")) return;
                
                best_attack = this._attackTarget(attacker, target, best_attack, simulation);
            });
        });

        if (best_attack.length <= 0) {
            // No attacking
            best_attack = [-1, -1];
            this.canAttack = false;
        } else {
            best_attack = [best_attack[0], best_attack[1]];
            this.history.push(["attack", best_attack.map(e => e.name || e)]);
        }

        this._restoreGame();

        return best_attack;
    }

    /**
     * @deprecated Do not use this. This only exists to warn you that this doesn't exist
     */
    legacy_attack_1() {
        game.input("WARNING: This AI model doesn't have a legacy attack. Please reset the `AIAttackModel` in the config back to -1.\n".yellow);
        return this.attack(); // Use the default attack model
    }

    /**
     * Makes the ai select a target.
     * 
     * @param {string} prompt The prompt to show the ai.
     * @param {boolean} elusive If the ai should care about `This minion can't be targetted by spells or hero powers`.
     * @param {"friendly" | "enemy" | null} force_side The side the ai should be constrained to.
     * @param {"minion" | "hero" | null} force_class The type of target the ai should be constrained to.
     * @param {string[]} flags Some flags
     * 
     * @returns {Card | Player | number | null} The target selected.
     */
    selectTarget(prompt, elusive, force_side, force_class, flags) {
        const fallback = () => {
            game.log("Falling back...");
            return this.backup_ai.selectTarget(prompt, elusive, force_side, force_class, flags);
        }

        /**
         * @type {Card}
         */
        let card;

        if (this.on_card) {
            this.history.push(["SelectTargetEvaluation", this.on_card.name]);
            card = this.on_card;
        }
        else {
            // Figure out the card that called select target
            let selections = game.events.PlayCardUnsafe;
            if (!selections) return fallback();

            selections = selections[this.plr.id];
            if (!selections) return fallback();

            card = selections[selections.length - 1];
            if (!card) return fallback();
            card = card[0];
        }

        // If one of the cards keyword methods has the word `selectTarget` in it.

        /**
         * @type {[[string, Function]]}
         */
        let functions = Object.entries(card.blueprint)
            .filter(e => e[1] instanceof Function);

        let func = functions.find(f => f[1].toString().includes("selectTarget"));
        if (!func) return fallback();

        let simulation = this._createSimulation();

        let plr = simulation["player" + (this.plr.id + 1)];
        let op = simulation["player" + (this.plr.getOpponent().id + 1)];
        let currboard = simulation.board[this.plr.id];
        let opboard = simulation.board[this.plr.getOpponent().id];

        /**
         * The targets that the ai can choose from
         * 
         * @type {[Card | Player]}
         */
        let targets = [
            plr,
            op,
            ...currboard,
            ...opboard
        ];

        if (force_side == "enemy") {
            game.functions.remove(targets, plr);
            game.functions.remove(targets, ...currboard);
        }
        else if (force_side == "friendly") {
            game.functions.remove(targets, op);
            game.functions.remove(targets, ...opboard);
        }

        if (force_class == "hero") {
            targets = targets.filter(t => t.classType == "Player");
        }
        else if (force_class == "minion") {
            targets = targets.filter(t => t.classType == "Card");
        }

        if (elusive) targets = targets.filter(t => t.classType != "Card" || !t.keywords.includes("Elusive"));

        /**
         * @type {[Card | Player, number]}
         */
        let best_target = [];

        targets.forEach(t => {
            if (flags.includes("allow_locations") && t.classType == "Card" && t.type != "Location") return;

            const simulation = this._createSimulation();
            const chosen_card = card.perfectCopy();
            chosen_card.getInternalGame();
            
            // Simulate choosing that target.
            let index;
            if (currboard.includes(t)) index = [plr.id, currboard.indexOf(t)];
            if (opboard.includes(t)) index = [plr.getOpponent().id, opboard.indexOf(t)];

            simulation.player.forceTarget = t;
            const result = chosen_card.activate(func[0]);

            if (index) simulation.board[index[0]][index[1]] = t;
            simulation.player.forceTarget = null;
            
            if (result == -1 || result.includes(-1)) return;

            const score = this._evaluate(simulation);
            if (score <= best_target[1]) return;

            // This is the new best target
            best_target = [t, score];
        });
        this._restoreGame();
        new game.Card("Sheep", game.player1).getInternalGame();

        this.history.push(["selectTarget", best_target.map(t => t.name || t)]);

        if (best_target.length <= 0) {
            // No targets
            return null;
        }

        return best_target[0];
    }

    /**
     * Choose the best minion to discover.
     * 
     * @param {Card[] | import("./card").Blueprint[]} cards The cards to choose from
     * @param {boolean} [care_about_mana=true] DO NOT USE THIS. If the ai should care about the cost of cards.
     * 
     * @returns {Card} Result
     */
    discover(cards) {
        return this._selectFromCards(cards, "discover");
    }

    /**
     * Choose the best card to dredge.
     * 
     * @param {Card[]} cards The cards to choose from
     * 
     * @returns {Card} Result
     */
    dredge(cards) {
        return this._selectFromCards(cards, "dredge");
    }

    /**
     * Choose the best option from `options`
     * 
     * @param {string[]} options The options the ai can pick from
     *
     * @returns {string} The question chosen
     */
    chooseOne(options) {
        // TODO: Add this
        return this.backup_ai.chooseOne(options);
    }

    /**
     * Choose the best answer from `options`
     *
     * @param {string} prompt The prompt to show to the ai
     * @param {string[]} options The options the ai can pick from
     *
     * @returns {number} The index of the option chosen + 1
     */
    question(prompt, options) {
        // TODO: Add this
        return this.backup_ai.question(prompt, options);
    }

    /**
     * Choose yes or no based on the prompt
     *
     * @param {string} prompt The prompt to show to the ai
     *
     * @returns {boolean} `true` if "Yes", `false` if "No"
     */
    yesNoQuestion(prompt) {
        // TODO: Add this
        return this.backup_ai.yesNoQuestion(prompt);
    }

    /**
     * Returns if the ai wants `card` to be traded
     *
     * @param {Card} card The card to check
     *
     * @returns {boolean} If the card should be traded
     */
    trade(card) {
        // TODO: Add this
        return this.backup_ai.trade(card);
    }

    /**
     * Returns the list of cards the ai wants to mulligan.
     * 
     * @returns {string} The indexes of the cards to mulligan. Look in `Interact.mulligan` for more details.
     */
    mulligan() {
        // TODO: Add this
        return this.backup_ai.mulligan();
    }

    _selectFromCards(cards, history_name, care_about_mana = true) {
        // This is currently being used by discover and dredge.

        // This is awful, but this looks like a good template for the other ai methods.
        // FIXME: This function causes memory leaks.
        // ^^^^ It might just be horrendus performance.

        // Temp fix for the performance, this skips the first loop.
        if (true /* TEMP LINE */) care_about_mana = false;

        /**
         * @type {[Card | string, number]}
         */
        let best_card = [];

        cards.forEach(card => {
            // TODO: Maybe try to create as few simulations as possible.
            this._restoreGame();
            let simulation = this._createSimulation();

            // Find the simulation version of this ai's player.
            /**
             * @type {Player}
             */
            let simplr = simulation["player" + (this.plr.id + 1)];

            // If the card is a blueprint, turn it into a card.
            if (!card.__ids) card = new game.Card(card.name, this.plr);

            // The card is now always a card instance.

            // We don't care about mana, so give the player infinite mana.
            // TODO: There might be a better way, like setting the costtype to be something non-existant
            // but that might be patched out later so i don't want to rely on it.
            if (!care_about_mana) simplr[card.costType] = 999999;

            // Play the card
            // FIXME: Wave of Apathy made the score 4.440892098500626e-16
            // ^^^^ The score is messed up overall. It is always 5-digits????
            this.on_card = card;
            let result = simulation.playCard(card, simplr);
            this.on_card = null;

            // Invalid card
            if (result !== true && !result instanceof Card || typeof result === "string") {

                return;
            }

            let score = this._evaluate(simulation);
            if (score <= best_card[1]) return;

            // This card is now the best card
            best_card = [card, score];
        });

        // FIXME: Is this necessary after the last restore game in the loop above?
        this._restoreGame();

        let score = best_card[1];
        best_card = best_card[0];

        // If a card wasn't chosen, choose the first card.
        if (!best_card) {
            // As a backup, do this process all again but this time we don't care about the cost of cards.
            // TODO: I'm not sure about this one. This looks like a nightmare on performance.
            if (care_about_mana) return this.discover(cards, false);

            // Choose the first discover card as the last resort.
            this.history.push([history_name, null]);
            return cards[0];
        }

        this.history.push([history_name, [best_card.name, score]]);

        return best_card;
    }

    /**
     * Evaluates the game
     * 
     * @param {Game} simulation
     * @param {boolean} [sentiment=true] If it should perform sentiment analysis on the card's desc.
     * 
     * @returns {number} The score
     */
    _evaluate(simulation, sentiment = true) {
        // TODO: Make this better
        let score = 0;
        const VALUE_BIAS = 0.1;

        simulation.board.forEach(c => {
            c.forEach(c => {
                let bias = (c.plr.id == this.plr.id) ? 1 : -1;
                let s = this._evaluateCard(c, sentiment);
                //if (bias == 1 && s < 0) s = 0;
                //if (bias == -1 && s > 0) s = -0;

                score += s * bias;
            });
        });

        [simulation.player1, simulation.player2].forEach(p => {
            Object.entries(p).forEach(e => {
                let [key, val] = e;
                if (typeof val !== "number") return;
                if (val == 0) return;
                if (["id"].includes(key)) return;

                if (["fatigue", "heroPowerCost", "overload"].includes(key)) val = -val;

                let bias = 1;
                if (p.id != this.plr.id) bias = -1;

                score += val * bias * VALUE_BIAS;
            });
        });

        [simulation.player1, simulation.player2].forEach(p => {
            [p.deck.length, p.hand.length, p.quests.length, p.sidequests.length, p.secrets.length].forEach(val => {
                let bias = 1;
                if (p.id != this.plr.id) bias = -1;

                score += val * bias * VALUE_BIAS;
            });
        });

        return score;
    }

    /**
     * Evaluates a card
     * 
     * @param {Card} c The card
     * @param {boolean} [sentiment=true] If it should perform sentiment analysis on the card's description
     * 
     * @returns {number} The score
     */
    _evaluateCard(c, sentiment = true) {
        let score = 0;

        if (c.type == "Minion" || c.type == "Weapon") score += (c.getAttack() + c.getHealth()) * game.config.AIStatsBias;
        else score += game.config.AISpellValue * game.config.AIStatsBias; // If the spell value is 4 then it the same value as a 2/2 minion
        score -= c.mana * game.config.AIManaBias;

        c.keywords.forEach(() => score += game.config.AIKeywordValue);
        Object.values(c).forEach(c => {
            if (c instanceof Array && c[0] instanceof Function) score += game.config.AIFunctionValue;
        });

        if (sentiment) score += this.backup_ai.analyzePositive(c.desc);
        if (!c.desc) score -= game.config.AINoDescPenalty;

        return score;
    }

    /**
     * Creates and returns a simulation
     * 
     * @returns {Game} The simulation
     */
    _createSimulation() {
        // Make a deep copy of the current game
        // Don't copy these props
        // FIXME: Why. Gets caught in an infinite loop.
        // FIXME: Mana increases without turn ending.
        // FIXME: The ai cannot play cards.
        let cards = game.cards;
        let events = game.events;
        let graveyard = game.graveyard;
        let config = game.config;
        let p1 = game.player1;
        let p2 = game.player2;
        let curr = game.player;
        let op = game.opponent;

        delete game.cards;
        delete game.events;
        delete game.graveyard;
        delete game.config;
        delete game.player1;
        delete game.player2;
        delete game.player;
        delete game.opponent;

        let count = 0;
        let simulation = lodash.cloneDeepWith(game, ()=>{count++});
        console.log(`cloned total ${count} nodes from rows`);

        game.cards = cards;
        game.events = events;
        game.graveyard = graveyard;
        game.config = config;
        game.player1 = p1;
        game.player2 = p2;
        game.player = curr;
        game.opponent = op;

        simulation.cards = cards;
        simulation.events = events;
        simulation.graveyard = graveyard;
        simulation.config = config;
        simulation.player1 = p1;
        simulation.player2 = p2;
        simulation.player = curr;
        simulation.opponent = op;
        simulation.simulation = true; // Mark it as a simulation

        [...simulation.player1.deck, ...simulation.player1.hand, ...simulation.player2.deck, ...simulation.player2.hand, ...simulation.player.deck, ...simulation.player.hand, ...simulation.opponent.deck, ...simulation.opponent.hand].forEach(c => {
            c.plr = simulation["player" + (c.plr.id + 1)];
        });

        set(simulation);
        simulation.interact.getInternalGame();
        simulation.functions.getInternalGame();

        return simulation;
    }

    /**
     * Restore the game
     */
    _restoreGame() {
        set(game);
        game.interact.getInternalGame();
        game.functions.getInternalGame();
    }
}

// FIXME: Ai gets stuck in infinite loop when using cathedral of atonement (location) | shadowcloth needle (0 attack wpn) | that minion has no attack.
class SentimentAI {
    /**
     * This is the old Sentiment Analysis based AI.
     * 
     * @param {Player} plr 
     */
    constructor(plr) {
        game = get();

        /**
         * @type {[[string, any]]}
         */
        this.history = [];

        /**
         * @type {string[]}
         */
        this.prevent = [];

        /**
         * @type {Card[]}
         */
        this.cards_played_this_turn = [];

        /**
         * @type {Card[]}
         */
        this.used_locations_this_turn = [];

        /**
         * @type {Card | null}
         */
        this.focus = null;

        this.plr = plr;
    }

    /**
     * Calculate the best move and return the result
     * 
     * @returns {Card | string} Result
     */
    chooseMove() {
        let best_move = null;
        let best_score = -100000;

        // Look for highest score
        this.plr.hand.forEach(c => {
            let score = this.analyzePositiveCard(c);

            if (score <= best_score || c.mana > this.plr.mana || this.cards_played_this_turn.includes(c)) return;

            // If the card is a minion and the player doesn't have the board space to play it, ignore the card
            if (["Minion", "Location"].includes(c.type) && game.board[this.plr.id].length >= game.config.maxBoardSpace) return;

            // Prevent the ai from playing the same card they returned from when selecting a target
            let r = false;

            this.history.forEach((h, i) => {
                if (h instanceof Array && h[1] === "0,1" && this.history[i - 1][1][0] == c.name) r = true;
            });
            if (r) return;

            best_move = c;
            best_score = score;
        });

        // If a card wasn't chosen
        if (!best_move) {
            // See if can hero power
            if (this._canHeroPower()) best_move = "hero power";

            // See if can attack
            else if (this._canAttack()) best_move = "attack";

            // See if has location
            else if (this._canUseLocation()) best_move = "use";

            else best_move = "end";

            this.history.push(["chooseMove", best_move]);
        }

        else {
            this.history.push(["chooseMove", [best_move.name, best_score]]);

            this.cards_played_this_turn.push(best_move);

            best_move = this.plr.hand.indexOf(best_move) + 1;
        }

        if (best_move == "end") {
            this.history.forEach((h, i) => {
                if (h instanceof Array && h[0] == "selectTarget" && h[1] == "0,1") this.history[i][1] = null;
            });

            this.cards_played_this_turn = [];
            this.used_locations_this_turn = [];
            this.prevent = [];
        }

        return best_move;
    }

    /**
     * Checks if there are any minions that can attack on the ai's board
     *
     * @returns {boolean} Can attack
     */
    _canAttack() {
        if (this.prevent.includes("attack")) return false;

        let valid_attackers = game.board[this.plr.id].filter(m => this._canMinionAttack(m));

        return valid_attackers.length > 0;
    }

    /**
     * Returns if the ai can use their hero power
     *
     * @returns {boolean} Can use hero power
     */
    _canHeroPower() {
        if (this.prevent.includes("hero power")) return false;

        let enoughMana = this.plr.mana >= this.plr.heroPowerCost;
        let canUse = this.plr.canUseHeroPower;

        let canHeroPower = enoughMana && canUse;

        this.prevent.push("hero power"); // The ai has already used their hero power that turn.

        return canHeroPower;
    }

    /**
     * Returns if there are any location cards the ai can use.
     *
     * @returns {boolean}
     */
    _canUseLocation() {
        if (this.prevent.includes("use")) return false;

        let valid_locations = game.board[this.plr.id].filter(m => m.type == "Location" && m.cooldown == 0 && !this.used_locations_this_turn.includes(m));

        return valid_locations.length > 0;
    }

    /**
     * Returns if the minion specified can attack
     *
     * @param {Card} m The minion to check
     *
     * @returns {boolean} Can attack
     */
    _canMinionAttack(m) {
        let booleans = !m.sleepy && !m.frozen && !m.dormant;
        let numbers = m.getAttack() && m.attackTimes;

        return booleans && numbers;
    }

    /**
     * Returns if the minion specified is targettable
     *
     * @param {Card} m Minion to check
     *
     * @returns {boolean} If it is targettable
     */
    _canTargetMinion(m) {
        let booleans = !m.dormant && !m.immune && !m.keywords.includes("Stealth");

        return booleans;
    }

    // ATTACKING
    /**
     * Finds all possible trades for the ai and returns them
     *
     * @returns {[Card[][], Card[][]]} `Perfect Trades`: [[attacker, target], ...], `Imperfect Trades`: [[attacker, target], ...]
     */
    _attackFindTrades() {
        let perfect_trades = [];
        let imperfect_trades = [];

        let currboard = game.board[this.plr.id].filter(m => this._canMinionAttack(m));

        currboard.forEach(a => {
            let trades = [...perfect_trades, ...imperfect_trades];

            let score = this.analyzePositiveCard(a);
            if (score > game.config.AIProtectThreshold || trades.map(c => c[0]).includes(a)) return; // Don't attack with high-value minions.

            if (a.sleepy || a.attackTimes <= 0) return;

            let opboard = game.board[this.plr.getOpponent().id].filter(m => this._canTargetMinion(m));

            opboard.forEach(t => {
                trades = [...perfect_trades, ...imperfect_trades];
                if (trades.map(c => c[1]).includes(t)) return;

                let score = this.analyzePositiveCard(t);
                if (score < game.config.AIIgnoreThreshold) return; // Don't waste resources attacking useless targets.

                if (a.getAttack() == t.getHealth()) perfect_trades.push([a, t]);
                else if (a.getAttack() > t.getHealth()) imperfect_trades.push([a, t]);
            });
        });

        return [perfect_trades, imperfect_trades];
    }

    /**
     * Returns a score for the player specified based on how good their position is.
     *
     * @param {Player} player The player to score
     * @param {import("./types").ScoreBoard} board The board to check
     *
     * @returns {number} Score
     */
    _scorePlayer(player, board) {
        let score = 0;

        board.forEach(m => {
            let [_minion, _score] = m;

            score += _score;
        });

        Object.entries(player).forEach(f => {
            let [key, val] = f;

            let i = ["health", "maxHealth", "armor", "maxMana"];
            if (!i.includes(key)) return;

            score += val;
        });

        score += player.deck.length;

        return score;
    }

    /**
     * Returns the player that is winning
     *
     * @param {import("./types").ScoreBoard} board The board to check
     *
     * @returns {[Player, number]} Winner, Score
     */
    _findWinner(board) {
        let score = this._scorePlayer(this.plr, board[this.plr.id]);
        let opScore = this._scorePlayer(this.plr.getOpponent(), board[this.plr.getOpponent().id]);

        let winner = (score > opScore) ? this.plr : this.plr.getOpponent();
        let s = (winner == this.plr) ? score : opScore;

        return [winner, s];
    }

    /**
     * Returns if there is a taunt on the board
     *
     * @param {boolean} [return_taunts=false] If the function should return the taunts it found, or just if there is a taunt. If this is true it will return the taunts it found.
     *
     * @returns {Card[] | boolean}
     */
    _tauntExists(return_taunts = false) {
        let taunts = game.board[this.plr.getOpponent().id].filter(m => m.keywords.includes("Taunt"));

        if (return_taunts) return taunts;

        return taunts.length > 0;
    }

    /**
     * Does a trade
     *
     * @returns {Card[] | null} Attacker, Target
     */
    _attackTrade() {
        let [perfect_trades, imperfect_trades] = this._attackFindTrades();

        let ret = null;
        if (perfect_trades.length > 0) ret = perfect_trades[0];
        else if (imperfect_trades.length > 0) ret = imperfect_trades[0];

        if (ret) this.history.push([`trade`, [ret[0].name, ret[1].name]]);

        return ret;
    }

    /**
     * Does a general attack
     *
     * @param {import("./types").ScoreBoard} board
     *
     * @returns {[Card | -1]} Attacker, Target
     */
    _attackGeneral(board) {
        let current_winner = this._findWinner(board);

        let ret = null;

        // Risky
        let op_score = this._scorePlayer(this.plr.getOpponent(), board[this.plr.getOpponent().id]);
        let risk_mode = current_winner[1] >= op_score + game.config.AIRiskThreshold // If the ai is winner by more than 'threshold' points, enable risk mode

        let taunts = this._tauntExists(); // If there are taunts, override risk mode

        if (risk_mode && !taunts) ret = this._attackGeneralRisky();
        else ret = this._attackGeneralMinion();

        this.history.push([`attack`, [ret[0].name, ret[1].name]]);

        if (!this.focus && ret[1] instanceof game.Card) this.focus = ret[1];

        return ret;
    }

    /**
     * Does a risky attack.
     *
     * @returns {Card[]} Attacker, Target
     */
    _attackGeneralRisky() {
        // Only attack the enemy hero
        return [this._attackGeneralChooseAttacker(true), this.plr.getOpponent()];
    }

    /**
     * Chooses the attacker and target
     * 
     * Use the return value of this function to actually attack by passing it into `game.attack`
     *
     * @returns {[Card | -1]} Attacker, Target
     */
    _attackGeneralMinion() {
        let target;

        // If the focused minion doesn't exist, select a new minion to focus
        if (!game.board[this.plr.getOpponent().id].find(a => a == this.focus)) this.focus = null;

        if (!this.focus || (this._tauntExists() && !this.focus.keywords.includes("Taunt"))) target = this._attackGeneralChooseTarget();
        else target = this.focus

        return [this._attackGeneralChooseAttacker(target instanceof game.Player), target];
    }

    /**
     * Choose a target for a general attack
     *
     * @returns {Card | Player | -1} Target | -1 (Go back)
     */
    _attackGeneralChooseTarget() {
        let highest_score = [null, -9999];

        let board = game.board[this.plr.getOpponent().id];

        // If there is a taunt, select that as the target
        let taunts = this._tauntExists(true);
        if (taunts.length > 0) return taunts[0];

        board = board.filter(m => this._canTargetMinion(m));

        board.forEach(m => {
            let score = this.analyzePositiveCard(m);

            if (score < highest_score[1]) return;

            highest_score = [m, score];
        });

        if (!highest_score[0]) return this.plr.getOpponent();

        if (!highest_score[0]) {
            this.prevent.push("attack");
            return -1;
        }

        return highest_score[0];
    }

    /**
     * Choose an attacker for a general attack
     *
     * @param {boolean} [target_is_player=false] If the target is a player
     *
     * @returns {Card | Player | -1} Attacker | -1 (Go back)
     */
    _attackGeneralChooseAttacker(target_is_player = false) {
        let lowest_score = [null, 9999];

        let board = game.board[this.plr.id];
        board = board.filter(c => this._canMinionAttack(c));

        board.forEach(m => {
            let score = this.analyzePositiveCard(m);

            if (score > lowest_score[1] || (score > game.config.AIProtectThreshold && !target_is_player)) return;

            if (m.sleepy || m.attackTimes <= 0) return;
            if (target_is_player && !m.canAttackHero) return;

            lowest_score = [m, score];
        });

        if (!lowest_score[0] && this.plr.attack > 0) return this.plr;

        if (!lowest_score[0]) {
            this.prevent.push("attack");
            return -1;
        }

        return lowest_score[0];
    }

    /**
     * Makes the ai attack
     *
     * @returns {[Card | Player | -1 | null, Card | Player | -1 | null]} Attacker, Target
     */
    attack() {
        // Assign a score to all minions
        let board = [[], []];
        game.board.forEach((p, i) => {
            p.forEach(m => {
                let score = this.analyzePositiveCard(m);

                board[i].push([m, score]);
            });
        });

        let amount_of_trades = this._attackFindTrades().map(t => t.length).reduce((a, b) => a + b);

        // The ai should skip the trade stage if in risk mode
        let current_winner = this._findWinner(board);
        let op_score = this._scorePlayer(this.plr.getOpponent(), board[this.plr.getOpponent().id]);
        let risk_mode = current_winner[1] >= op_score + game.config.AIRiskThreshold // If the ai is winner by more than 'threshold' points, enable risk mode

        let taunts = this._tauntExists();
        if (taunts) return this._attackGeneral(board); // If there is a taunt, attack it before trading

        if (amount_of_trades > 0 && !risk_mode) return this._attackTrade();
        return this._attackGeneral(board);
    }

    /**
     * Makes the ai attack
     * 
     * @deprecated Use `AI.attack` instead.
     * 
     * @returns {Card[] | -1} Attacker and target
     */
    legacy_attack_1() { // This gets called if you set the ai attack model to 1
        let worst_minion;
        let worst_score = 100000;
        
        game.board[this.plr.id].filter(m => !m.sleepy && !m.frozen && !m.dormant).forEach(m => {
            let score = this.analyzePositiveCard(m);

            if (score >= worst_score) return;

            worst_minion = m;
            worst_score = score;
        });

        let attacker = worst_minion;
        
        let target; 
        let targets;

        let best_minion;
        let best_score = -100000;

        // Check if there is a minion with taunt
        let taunts = game.board[this.plr.getOpponent().id].filter(m => m.keywords.includes("Taunt"));
        if (taunts.length > 0) targets = taunts.filter(m => !m.immune && !m.dormant);
        else targets = game.board[this.plr.getOpponent().id].filter(m => !m.immune && !m.dormant);

        targets.forEach(m => {
            let score = this.analyzePositiveCard(m);

            if (score <= best_score) return;

            best_minion = m;
            best_score = score;
        });
        target = best_minion;

        // If the AI has no minions to attack, attack the enemy hero
        if (!target) {
            if (!taunts.length && attacker && attacker.canAttackHero) target = this.plr.getOpponent();
            else {
                attacker = -1;
                target = -1;

                this.prevent.push("attack");
            }
        }
        if (!attacker && this.plr.attack > 0) attacker = this.plr;

        let arr = [];
        let strbuilder = "";

        if (attacker instanceof game.Player) arr.push("P" + (attacker.id + 1));
        else {
            arr.push(attacker.name);
            strbuilder += worst_score + ", ";
        }
            
        if (target instanceof game.Player) arr.push("P" + (target.id + 1));
        else {
            arr.push(target.name);
            strbuilder += best_score;
        }

        this.history.push([`attack, [${strbuilder}]`, arr]);

        return [attacker, target];
    }
    // -------------

    /**
     * Makes the ai select a target.
     * 
     * @param {string} prompt The prompt to show the ai.
     * @param {boolean} elusive If the ai should care about `This minion can't be targetted by spells or hero powers`.
     * @param {"friendly" | "enemy" | null} force_side The side the ai should be constrained to.
     * @param {"minion" | "hero" | null} force_class The type of target the ai should be constrained to.
     * @param {string[]} flags Some flags
     * 
     * @returns {Card | Player | number} The target selected.
     */
    selectTarget(prompt, elusive, force_side, force_class, flags) {
        if (flags.includes("allow_locations") && force_class != "hero") {
            let locations = game.board[this.plr.id].filter(m => m.type == "Location" && m.cooldown == 0 && !this.used_locations_this_turn.includes(m));
            this.used_locations_this_turn.push(locations[0]);

            if (locations.length > 0) return locations[0];
        }

        let op = this.plr.getOpponent();
        let id = this.plr.id;

        let side = null;

        let score = this.analyzePositive(prompt, false);

        if (score > 0) side = "self";
        else if (score < 0) side = "enemy";

        if (force_side) side = force_side;

        let sid = (side == "self") ? id : op.id;

        if (game.board[sid].length <= 0 && force_class == "minion") {
            this.history.push(["selectTarget", "0,1"]);

            return false;
        }

        if (force_class && force_class == "hero") {
            let ret = -1;

            if (side == "self") ret = this.plr;
            else if (side == "enemy") ret = op;
            let _ret = (ret instanceof game.Player) ? "P" + (ret.id + 1) : ret;

            this.history.push(["selectTarget", _ret]);

            return ret;
        }

        // The player has no minions, select their face
        if (game.board[sid].length <= 0) {
            let ret = false;

            if (force_class != "minion") {
                ret = game["player" + (sid + 1)];
                this.history.push(["selectTarget", "P" + (ret.id + 1)]);
            }
            else this.history.push(["selectTarget", -1]);

            return ret;
        }

        let selected = null;

        let best_minion = false;
        let best_score = -100000;

        game.board[sid].forEach(m => {
            if (!this._canTargetMinion(m)) return;
            if ((elusive && m.elusive) || m.type == "Location") return;
            
            let s = this.analyzePositiveCard(m);

            if (s <= best_score) return;

            best_minion = m;
            best_score = s;
        });

        selected = best_minion;

        if (selected) {
            this.history.push(["selectTarget", `${selected.name},${best_score}`]);
            //this.history.push(["selectTarget", [selected.name, best_score]]);

            return selected;
        }

        this.history.push(["selectTarget", -1]);
        return false;
    }

    /**
     * Choose the "best" discover minion.
     * 
     * @param {Card[] | import("./card").Blueprint[]} cards The cards to choose from
     * 
     * @returns {Card} Result
     */
    discover(cards) {
        let best_card = null;
        let best_score = -100000;

        // Look for highest score
        cards.forEach(c => {
            let score = this.analyzePositiveCard(new game.Card(c.name, this.plr));

            if (score <= best_score) return;

            best_card = c;
            best_score = score;
        });

        this.history.push(["discover", [best_card.name, best_score]]);

        best_card = new game.Card(best_card.name, this.plr); // `cards` can be a list of blueprints, so calling best_card.imperfectCopy is dangerous

        return best_card;
    }

    /**
     * Choose the "best" card to dredge.
     * 
     * @param {Card[]} cards The cards to choose from
     * 
     * @returns {Card} Result
     */
    dredge(cards) {
        let best_card = null;
        let best_score = -100000;

        // Look for highest score
        cards.forEach(c => {
            let score = this.analyzePositiveCard(c);

            if (score <= best_score) return;

            best_card = c;
            best_score = score;
        });

        let name = best_card ? best_card.name : null

        this.history.push(["dredge", [name, best_score]]);

        return best_card;
    }

    /**
     * Choose the "best" option from `options`
     * 
     * @param {string[]} options The options the ai can pick from
     *
     * @returns {number} The index of the question chosen
     */
    chooseOne(options) {
        // I know this is a bad solution
        // "Deal 2 damage to a minion; or Restore 5 Health."
        // ^^^^^ It will always choose to restore 5 health, since it sees deal 2 damage as bad but oh well, future me problem.
        // ^^^^^ Update 29/05/23  TODO: Fix this
        let best_choice = null;
        let best_score = -100000;
 
        // Look for highest score
        options.forEach((c, i) => {
            let score = this.analyzePositive(c);

            if (score <= best_score) return;

            best_choice = i;
            best_score = score;
        });
 
        this.history.push(["chooseOne", [best_choice, best_score]]);

        return best_choice;
    }

    /**
     * Choose the "best" answer from `options`
     *
     * @param {string} prompt The prompt to show to the ai
     * @param {string[]} options The options the ai can pick from
     *
     * @returns {number} The index of the option chosen + 1
     */
    question(prompt, options) {
        let best_choice = null;
        let best_score = -100000;

        options.forEach((v, i) => {
            let score = this.analyzePositive(v);

            if (score <= best_score) return;

            best_choice = i;
            best_score = score;
        });

        this.history.push([`question: ${prompt}`, [best_choice, best_score]]);

        return best_choice + 1;
    }

    /**
     * Choose yes or no based on the prompt
     *
     * @param {string} prompt The prompt to show to the ai
     *
     * @returns {boolean} `true` if "Yes", `false` if "No"
     */
    yesNoQuestion(prompt) {
        let score = this.analyzePositive(prompt);
        let ret;

        if (score > 0) ret = true;
        else ret = false;

        this.history.push(["yesNoQuestion", [prompt, ret]]);

        return ret;
    }

    /**
     * Returns if the ai wants `card` to be traded
     *
     * @param {Card} card The card to check
     *
     * @returns {boolean} If the card should be traded
     */
    trade(card) {
        if (this.plr.deck.length <= 1) return false; // If the ai doesn't have any cards to trade into, don't trade the card.
        if (this.plr.mana < 1) return false; // If the ai can't afford to trade, don't trade the card

        let score = this.analyzePositiveCard(card);

        let ret = score <= game.config.AITradeThreshold;

        this.history.push(["trade", [card.name, ret, score]]);

        return ret;
    }

    /**
     * Returns the list of cards the ai wants to mulligan.
     * 
     * @returns {string} The indexes of the cards to mulligan. Look in `Interact.mulligan` for more details.
     */
    mulligan() {
        let to_mulligan = "";

        let _scores = "(";

        this.plr.hand.forEach(c => {
            if (c.name == "The Coin") return;

            let score = this.analyzePositiveCard(c);

            if (score < game.config.AIMulliganThreshold) to_mulligan += (this.plr.hand.indexOf(c) + 1).toString();

            _scores += `${c.name}:${score}, `;
        });

        _scores = _scores.slice(0, -2) + ")";

        this.history.push([`mulligan (T${game.config.AIMulliganThreshold})`, [to_mulligan, _scores]]);

        return to_mulligan;
    }

    /**
     * Analyze a string and return a score based on how "positive" the ai thinks it is
     *
     * @param {string} str The string to analyze
     * @param {boolean} context Enable context analysis
     * 
     * @returns {number} The score the string gets
     */
    analyzePositive(str, context = true) {
        if (context) context = game.config.AIContextAnalysis;
        let score = 0;

        str.toLowerCase().split(/[^a-z0-9 ]/).forEach(i => {
            i = i.trim();

            i.split(" ").forEach(s => {
                // Filter out any characters not in the alphabet
                s = s.replace(/[^a-z]/g, "");
                let ret = false;

                Object.entries(game.config.AISentiments).forEach(v => {
                    if (ret) return;

                    Object.entries(v[1]).forEach(k => {
                        if (ret) return;

                        const k0 = k[0].replace(/^(.*)[sd]$/, "$1"); // Remove the last "s" or "d" in order to account for plurals 
                        if (!new RegExp(k[0]).test(s) && !new RegExp(k0).test(s)) return;

                        // If the sentiment is "positive", add to the score. If it is "negative", subtract from the score.
                        let opponent_test = /enemy|enemies|opponent/;
                        let pos = k[1];
                        if (context && opponent_test.test(i)) pos = -pos;
                        score -= (v[0] == "positive") ? -pos : pos;
                        ret = true;
                        return;
                    });
                });
            });
        });

        return score;
    }

    /**
     * Same as `analyzePositive` but changes the score based on a card's positive and negative values.
     * Passes the card's description into `analyzePositive`.
     *
     * @param {Card} c The card to analyze
     *
     * @returns {number} The score
     */
    analyzePositiveCard(c) {
        let score = this.analyzePositive(c.desc);

        if (c.type == "Minion" || c.type == "Weapon") score += (c.getAttack() + c.getHealth()) * game.config.AIStatsBias;
        else score += game.config.AISpellValue * game.config.AIStatsBias; // If the spell value is 4 then it the same value as a 2/2 minion
        score -= c.mana * game.config.AIManaBias;

        c.keywords.forEach(() => score += game.config.AIKeywordValue);
        Object.values(c).forEach(c => {
            if (c instanceof Array && c[0] instanceof Function) score += game.config.AIFunctionValue;
        });

        return score;
    }
}

exports.SimulationAI = SimulationAI;
exports.SentimentAI = SentimentAI;
