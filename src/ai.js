let game = null;

function setup(_game) {
    game = _game;
}

class AI {
    constructor(plr) {
        this.history = [];
        this.prevent = [];

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
            let score = this.analyzePositiveCard(c.desc, c);

            if (score > best_score && c.mana <= this.plr.mana) {
                // Prevent the ai from playing the same card they returned from when selecting a target
                let r = false;

                this.history.forEach((h, i) => {
                    if (h instanceof Array && h[1] === "0,1") r = true;
                });
                if (r) return;

                best_move = c;
                best_score = score;
            }
        });

        if (!best_move || (["Minion", "Location"].includes(best_move.type) && game.board[this.plr.id].length >= game.constants.maxBoardSpace)) {
            // See if can hero power
            if (this.plr.mana >= this.plr.heroPowerCost && this.plr.canUseHeroPower && !this.prevent.includes("hero power")) best_move = "hero power";

            // See if can attack
            else if (game.board[this.plr.id].filter(m => !m.sleepy && !m.frozen && !m.dormant).length) best_move = "attack";

            // See if has location
            else if (game.board[this.plr.id].filter(m => m.type == "Location" && m.cooldown == 0).length) best_move = "use";

            else best_move = "end";

            this.history.push(["calcMove", best_move]);
        }

        else this.history.push(["calcMove", [best_move, best_score]]);

        this.history.forEach((h, i) => {
            if (h instanceof Array && h[0] == "selectTarget" && h[1] == "0,1") this.history[i][1] = "0,0";
        });

        return best_move;
    }
    chooseBattle() {
        /**
         * Choose attacker and target
         * 
         * @returns {Card[]} Attacker and target
         */

        // Todo: Make this more advanced
        let attacker = game.board[this.plr.id].filter(m => !m.sleepy && !m.frozen && !m.dormant);
        attacker = game.functions.randList(attacker, false);
        
        let target = undefined;

        // Check if there is a minion with taunt
        let taunts = game.board[this.plr.getOpponent().id].filter(m => m.keywords.includes("Taunt"));
        if (taunts.length > 0) {
            let _taunts = game.board[this.plr.getOpponent().id].filter(m => m.keywords.includes("Taunt") && !m.immune && !m.dormant);
            target = game.functions.randList(_taunts, false);
        }
        else {
            target = game.board[this.plr.getOpponent().id].filter(m => !m.immune && !m.dormant);
            target = game.functions.randList(target, false);
        }

        // If the AI has no minions to attack, attack the enemy hero
        if (!target) {
            if (taunts.length) {
                attacker = -1;
                target = -1;

                this.prevent.push("attack");
            }
            else target = this.plr.getOpponent();
        }

        this.history.push(["chooseBattle", [attacker, target]]);

        return [attacker, target];
    }
    selectTarget(prompt, elusive, force_side, force_class, flags) {
        /**
         * Analyze prompt and find if it is a good thing or not, if it is, select a friendly target
         * 
         * @returns {Card | Player | number} Target
         */

        let op = this.plr.getOpponent();
        let id = this.plr.id;

        let side = null;

        let score = this.analyzePositive(prompt);

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

            this.history.push(["selectTarget", ret]);

            return ret;
        }

        // The player has no minions, select their face
        if (game.board[sid].length <= 0) {
            let ret = -1;

            if (force_class != "minion") ret = game["player" + (sid + 1)];
            
            this.history.push(["selectTarget", ret]);

            return ret;
        }

        let selected = null;

        if (flags["allow_locations"]) {
            let b = board[sid].filter(m => m.type == "Location" && m.cooldown == 0);
            if (b) {
                do selected = game.functions.randList(b, false);
                while((!selected) || (elusive && selected.elusive));

                if (selected) {
                    this.history.push(["selectTarget", selected]);

                    return selected;
                }
            }
        }

        do selected = game.functions.randList(game.board[sid], false);
        while((!selected) || (elusive && selected.elusive) || (!flags["allow_locations"] && selected.type == "Location"));

        if (selected) {
            this.history.push(["selectTarget", selected]);

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
            let score = this.analyzePositiveCard(c.desc, c);

            if (score > best_score) {
                best_card = c;
                best_score = score;
            }
        });

        this.history.push(["discover", [best_card, best_score]]);

        return best_card;
    }
    chooseOne(options) {
        /**
         * Choose the "best" option from options
         * 
         * @param {string[]} options The options the ai can pick from
         */

        // I know this is a bad solution
        // "Deal 2 damage to a minion; or Restore 5 Health."
        // ^^^^^ It will always choose to restore 5 health, since it sees deal 2 damage as bad but oh well, future me problem.
        let best_choice = null;
        let best_score = -100000;
 
        // Look for highest score
        options.forEach((c, i) => {
            let score = this.analyzePositive(c);

            if (score > best_score) {
                best_choice = i;
                best_score = score;
            }
        });
 
        this.history.push(["chooseOne", [best_choice, best_score]]);

        return best_choice;
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

            let score = this.analyzePositiveCard(c.desc, c);

            if (score <= (game.constants.AIMulliganThreshold / 10)) to_mulligan += (this.plr.hand.indexOf(c) + 1).toString();

            _scores += `${c.name}:${score}, `;
        });

        _scores = _scores.slice(0, -2) + ")";

        this.history.push(["mulligan", [to_mulligan, _scores]]);

        return to_mulligan;
    }

    analyzePositive(str) {
        /**
         * Analyze a string and return a score based on how "positive" the ai thinks it is
         * 
         * @returns {number} The score
         */

        let score = 0;
        const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

        str.split(" ").forEach(s => {
            // Filter out any characters not in the alphabet
            s = s.toLowerCase().split("").filter(c => ALPHABET.split("").includes(c)).join("");

            if (["heal", "give", "gain", "+", "restore", "attack", "health", "copy", "draw", "mana", "enemy", "trigger", "twice", "double"].includes(s)) score++;
            if (["deal", "remove", "damage", "silence", "destroy", "kill", "-"].includes(s)) score--;
        });

        return score;
    }
    analyzePositiveCard(str, c) {
        /**
         * Same as analyzePositive but changes the score based on a card's stats (if it has) and cost.
         */

        let score = this.analyzePositive(str);

        if (c.type == "Minion" || c.type == "Weapon") score += (c.getAttack() + c.getHealth()) / 10;
        else score += game.constants.AISpellValue / 10;
        score -= c.mana / 4;

        return score;
    }
}

exports.AI = AI;
exports.setup_ai = setup;
