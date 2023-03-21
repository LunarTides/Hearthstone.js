let game = null;

function setup(_game) {
    game = _game;
}

class AI {
    constructor(plr) {
        this.history = [];
        this.prevent = [];

        this.cards_played_this_turn = [];

        this.plr = plr;
    }

    calcMove() {
        /**
         * Calculate the best move and return the result
         * 
         * @returns {Card | string} Result
         */

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

        if (!best_move) {
            // See if can hero power
            if (this.plr.mana >= this.plr.heroPowerCost && this.plr.canUseHeroPower && !this.prevent.includes("hero power")) best_move = "hero power";

            // See if can attack
            else if (game.board[this.plr.id].filter(m => !m.sleepy && !m.frozen && !m.dormant).length && !this.prevent.includes("attack")) best_move = "attack";

            // See if has location
            else if (game.board[this.plr.id].filter(m => m.type == "Location" && m.cooldown == 0).length) best_move = "use";

            else best_move = "end";

            this.history.push(["calcMove", best_move]);
        }

        else {
            this.history.push(["calcMove", [best_move.name, best_score]]);

            this.cards_played_this_turn.push(best_move);
        }

        if (best_move == "end") {
            this.history.forEach((h, i) => {
                if (h instanceof Array && h[0] == "selectTarget" && h[1] == "0,1") this.history[i][1] = null;
            });

            this.cards_played_this_turn = [];
            this.prevent = [];
        }

        return best_move;
    }

    // ATTACKING
    _attackFindTrades(board) {
        /**
         * Finds all possible trades for the ai and returns them
         *
         * @returns {[Card[][], Card[][]]} The trades: Perfect Trades: [[attacker, target], [attacker, target]], Imperfect Trades: <---- Same
         */

        let perfect_trades = [];
        let imperfect_trades = [];

        game.board[this.plr.id].forEach(a => {
            let trades = [...perfect_trades, ...imperfect_trades];

            let score = this.analyzePositiveCard(a);
            if (score > game.config.AIProtectThreshold || trades.map(c => c[0]).includes(a)) return; // Don't attack with high-value minions.

            if (a.sleepy || a.attackTimes <= 0) return;

            game.board[this.plr.getOpponent().id].forEach(t => {
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
    _scorePlayer(player, board) {
        let score = 0;

        board.forEach(m => {
            let [_minion, _score] = m;

            score += score;
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
    _findWinner(board) {
        let score = this._scorePlayer(this.plr, board[this.plr.id]);
        let opScore = this._scorePlayer(this.plr.getOpponent(), board[this.plr.getOpponent().id]);

        let winner = (score > opScore) ? this.plr : this.plr.getOpponent();
        let s = (winner == this.plr) ? score : opScore;

        return [winner, s];
    }
    _attackTrade(board) {
        let [perfect_trades, imperfect_trades] = this._attackFindTrades();

        let ret = null;
        if (perfect_trades.length > 0) ret = perfect_trades[0];
        else if (imperfect_trades.length > 0) ret = imperfect_trades[0];

        this.history.push([`trade`, [ret[0].name, ret[1].name]]);

        return ret;
    }
    _attackGeneral(board) {
        let current_winner = this._findWinner(board);

        let ret = null;

        // Risky
        let is_winner = current_winner[0] == this.plr;
        let op_score = this._scorePlayer(this.plr.getOpponent(), board[this.plr.getOpponent().id]);
        let risk_mode = current_winner[1] >= op_score + game.config.AIRiskThreshold // If the ai is winner by more than 'threshold' points, enable risk mode

        let taunts = game.board[this.plr.getOpponent().id].filter(m => m.keywords.includes("Taunt")); // If there are taunts, override risk mode

        if (is_winner && risk_mode && taunts.length <= 0) ret = this._attackGeneralRisky();
        else ret = this._attackGeneralMinion();

        this.history.push([`attack`, [ret[0].name, ret[1].name]]);

        return ret;
    }
    _attackGeneralRisky() {
        // Only attack the enemy hero
        return [this._attackGeneralChooseAttacker(true), this.plr.getOpponent()];
    }
    _attackGeneralMinion() {
        let target = this._attackGeneralChooseTarget();
        return [this._attackGeneralChooseAttacker(target instanceof game.Player), target];
    }
    _attackGeneralChooseTarget() {
        let highest_score = [null, -9999];

        let board = game.board[this.plr.getOpponent().id];

        // If there is a taunt, select that as the target
        let taunts = board.filter(m => m.keywords.includes("Taunt"));
        if (taunts.length > 0) return taunts[0];

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
    _attackGeneralChooseAttacker(target_is_player = false) {
        let lowest_score = [null, 9999];

        game.board[this.plr.id].forEach(m => {
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
    chooseBattle() {
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
        let is_winner = current_winner[0] == this.plr;
        let op_score = this._scorePlayer(this.plr.getOpponent(), board[this.plr.getOpponent().id]);
        let risk_mode = current_winner[1] >= op_score + game.config.AIRiskThreshold // If the ai is winner by more than 'threshold' points, enable risk mode

        let taunts = game.board[this.plr.getOpponent().id].filter(m => m.keywords.includes("Taunt"));

        if (taunts.length > 0) return this._attackGeneral(board); // If there is a taunt, attack it before trading

        if (amount_of_trades > 0 && !risk_mode) return this._attackTrade(board);
        return this._attackGeneral(board);
    }

    old_chooseBattle() {
        /**
         * Choose attacker and target
         * 
         * @returns {Card[]} Attacker and target
         */

        // Todo: Make this more advanced
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
            if (!taunts.length && attacker.canAttackHero || true) target = this.plr.getOpponent();
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

        this.history.push([`chooseBattle, [${strbuilder}]`, arr]);

        return [attacker, target];
    }
    // -------------

    selectTarget(prompt, elusive, force_side, force_class, flags) {
        /**
         * Analyze prompt and find if it is a good thing or not, if it is, select a friendly target
         * 
         * @returns {Card | Player | number} Target
         */

        let op = this.plr.getOpponent();
        let id = this.plr.id;

        let side = null;

        let score = this.analyzePositive(prompt, false);

        if (score > 0) side = "self";
        else if (score < 0) side = "enemy";

        let sid = (side == "self") ? id : op.id;

        if (game.board[sid].length <= 0 && force_class == "minion") {
            this.history.push(["selectTarget", "0,1"]);

            return false;
        }

        if (force_side) side = force_side;
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
            let ret = -1;

            if (force_class != "minion") {
                ret = game["player" + (sid + 1)];
                this.history.push(["selectTarget", "P" + (ret.id + 1)]);
            }
            else this.history.push(["selectTarget", -1]);

            return ret;
        }

        let selected = null;

        let best_minion;
        let best_score = -100000;

        game.board[sid].forEach(m => {
            if ((elusive && m.elusive) || m.type == "Location") return;
            
            let s = this.analyzePositiveCard(m);

            if (s <= best_score) return;

            best_minion = m;
            best_score = s;
        });

        if (flags["allow_locations"]) {
            let b = game.board[sid].filter(m => m.type == "Location" && m.cooldown == 0);
            if (b) {
                do selected = game.functions.randList(b, false);
                while((!selected) || (elusive && selected.elusive));

                if (selected) {
                    this.history.push(["selectTarget", selected.name]);

                    return selected;
                }
            }
        }
        
        selected = best_minion;

        if (selected) {
            this.history.push(["selectTarget", `${selected.name},${best_score}`]);
            //this.history.push(["selectTarget", [selected.name, best_score]]);

            return selected;
        }

        this.history.push(["selectTarget", -1]);
        return -1;
    }
    discover(cards) {
        /**
         * Choose the "best" discover minion.
         * 
         * @param {Card[] | Blueprint[]} cards The cards to choose from
         * 
         * @returns {Card} Result
         */

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

        return best_card;
    }
    dredge(cards) {
        /**
         * Choose the "best" card to dredge.
         * 
         * @param {Card[]} cards The cards to choose from
         * 
         * @returns {Card} Result
         */

        let best_card = null;
        let best_score = -100000;

        // Look for highest score
        cards.forEach(c => {
            let score = this.analyzePositiveCard(c);

            if (score <= best_score) return;

            best_card = c;
            best_score = score;
        });

        this.history.push(["dredge", [best_card.name, best_score]]);

        return best_card;
    }
    chooseOne(options) {
        /**
         * Choose the "best" option from options
         * 
         * @param {string[]} options The options the ai can pick from
         *
         * @returns {number} The id of the question chosen
         */

        // I know this is a bad solution
        // "Deal 2 damage to a minion; or Restore 5 Health."
        // ^^^^^ It will always choose to restore 5 health, since it sees deal 2 damage as bad but oh well, future me problem.
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
    question(prompt, options) {
        /**
         * Choose the "best" answer from options
         *
         * @param {string} prompt The prompt asked
         * @param {string[]} options The options the ai can pick from
         *
         * @returns {number} The id of the option chosen
         */

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
    yesNoQuestion(prompt) {
        /**
         * Choose yes or no based on the prompt
         *
         * @param {string} prompt The prompt asked
         *
         * @returns {char} Y | N
         */

        let score = this.analyzePositive(prompt);
        let ret;

        if (score > 0) ret = 'Y';
        else ret = 'N';

        ret = 'N'; // TODO: Make this whole function better

        this.history.push(["yesNoQuestion", [prompt, ret]]);

        return ret;
    }
    mulligan() {
        /**
         * Makes the ai mulligan cards
         * 
         * @returns {string} The indexes of the cards to mulligan. Look at mulligan() in interact.js for more details.
         */

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

    analyzePositive(str, context = true) {
        /**
         * Analyze a string and return a score based on how "positive" the ai thinks it is
         *
         * @param {string} str The string to analyze
         * @param {bool} context Enable context analysis
         * 
         * @returns {number} The score
         */

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
    analyzePositiveCard(c) {
        /**
         * Same as analyzePositive but changes the score based on a card's stats (if it has) and cost.
         *
         * @param {Card} c The card to analyze
         *
         * @returns {number} The score
         */

        let score = this.analyzePositive(c.desc);

        if (c.type == "Minion" || c.type == "Weapon") score += (c.getAttack() + c.getHealth()) * game.config.AIStatsBias;
        else score += game.config.AISpellValue * game.config.AIStatsBias; // If the spell value is 4 then it the same value as a 2/2 minion
        score -= c.mana * game.config.AIManaBias;

        c.keywords.forEach(k => score += game.config.AIKeywordValue);
        Object.values(c).forEach(c => {
            if (c instanceof Array && c[0] instanceof Function) score += game.config.AIFunctionValue;
        });

        return score;
    }
}

exports.AI = AI;
exports.setup_ai = setup;
