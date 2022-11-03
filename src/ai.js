let game = null;
let cards = [];

function setup(_game, _cards) {
    game = _game;
    cards = _cards
}

class AI {
    constructor(plr) {
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
            let score = this.analyzePositive(c.desc);

            if (score > best_score && c.mana <= this.plr.mana) {
                best_move = c;
                best_score = score;
            }
        });

        if (!best_move) {
            // See if can hero power
            if (this.plr.mana >= this.plr.heroPowerCost) return "hero power";

            // See if can attack
            if (game.board[this.plr.id].filter(m => !m.sleepy && !m.frozen && !m.dormant).length) {
                if (game.board[this.plr.getOpponent().id].filter(m => !m.immune && !m.dormant).length)
                    return "attack";
            }

            // See if has location
            if (game.board[this.plr.id].filter(m => m.type == "Location" && m.cooldown == 0).length) return "use";

            return "end";
        }
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
        
        let target;

        // Check if there is a minion with taunt
        let taunts = game.board[this.plr.getOpponent().id].filter(m => m.keywords.includes("Taunt"));
        if (taunts.length > 0) target = game.functions.randList(taunts, false);
        else {
            target = game.board[this.plr.getOpponent().id].filter(m => !m.immune && !m.dormant);
            target = game.functions.randList(target, false);
        }

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

        let bsl = game.board[id].length;
        let bol = game.board[op.id].length;

        if (score > 0 && bsl) side = "self";
        else if (score < 0 && bol) side = "enemy";
        else if (bsl || bol) side = (game.functions.randInt(0,1)) ? "self" : "enemy";

        if (force_side) side = force_side;
        if (force_class && force_class == "hero") {
            if (side == "self") return this.plr;
            else if (side == "enemy") return op;

            return -1;
        }

        if (!side) return -1;

        let sid = (side == "self") ? id : op.id;

        let selected = null;

        if (flags["allow_locations"]) {
            let b = board[sid].filter(m => m.type == "Location" && m.cooldown == 0);
            if (b) {
                do selected = game.functions.randList(b, false);
                while((!selected) || (elusive && selected.elusive));

                if (selected) return selected;
            }
        }

        do selected = game.functions.randList(game.board[sid], false);
        while((!selected) || (elusive && selected.elusive) || (!flags["allow_locations"] && selected.type == "Location"));

        if (selected) return selected;

        return -1;
    }

    analyzePositive(str) {
        let score = 0;
        const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

        str.split(" ").forEach(s => {
            // Filter out any characters not in the alphabet
            s = s.toLowerCase().split("").filter(c => ALPHABET.split("").includes(c)).join("");

            if (["heal", "give", "gain", "+", "restore", "attack", "health", "copy"].includes(s)) score++;;
            if (["deal", "remove", "damage", "silence", "-"].includes(s)) score--;
        });

        return score;
    }
}

exports.AI = AI;
exports.setup_ai = setup;