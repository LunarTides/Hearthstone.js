import { Card, Player, Game, get } from "./internal.js";
import { AICalcMoveOption, AIHistory, CardLike, ScoredCard, SelectTargetAlignment, SelectTargetClass, SelectTargetFlag, Target } from "./types.js";

let game: Game;

function getInternalGame() {
    let tempGame = get();
    if (!tempGame) return;

    game = tempGame;
}

getInternalGame();

// FIXME: Ai gets stuck in infinite loop when using cathedral of atonement (location) | shadowcloth needle (0 attack wpn) | that minion has no attack.
export class AI {
    /**
     * The player that the AI is playing for
     */
    plr: Player;

    /**
     * The history of the AI. Also known as its "logs".
     */
    history: AIHistory[] = [];

    /**
     * Prevent the ai from doing the actions that are in this array
     */
    prevent: string[] = [];

    /**
     * The cards that the AI has played this turn
     */
    cards_played_this_turn: Card[] = [];

    /**
     * The locations that the AI has used this turn
     */
    used_locations_this_turn: Card[] = [];

    /**
     * The card that the AI has focused, and is trying to kill
     */
    focus: Card | null = null;

    /**
     * Sentiment-based AI
     */
    constructor(plr: Player) {
        getInternalGame();

        this.plr = plr;
    }

    /**
     * Calculate the best move and return the result.
     * 
     * This can return: A card to play, "hero power", "attack", "use" or "end"
     * 
     * @returns Result
     */
    calcMove(): AICalcMoveOption {
        let best_move: AICalcMoveOption;
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
                if (h.data instanceof Array && h.data[1] === "0,1" && this.history[i - 1].data[0] == c.name) r = true;
            });
            if (r) return;

            best_move = c;
            best_score = score;
        });

        // If a card wasn't chosen
        // @ts-expect-error
        if (!best_move) {
            // See if can hero power
            if (this._canHeroPower()) best_move = "hero power";

            // See if can attack
            else if (this._canAttack()) best_move = "attack";

            // See if has location
            else if (this._canUseLocation()) best_move = "use";

            else best_move = "end";

            this.history.push({"type": "calcMove", "data": best_move});
        }

        else if (best_move instanceof Card) {
            this.history.push({"type": "calcMove", "data": [best_move.name, best_score]});

            this.cards_played_this_turn.push(best_move);
        }

        if (best_move == "end") {
            this.history.forEach((h, i) => {
                if (h instanceof Array && h[0] == "selectTarget" && h[1] == "0,1") this.history[i].data = null;
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
     * @returns Can attack
     */
    _canAttack(): boolean {
        if (this.prevent.includes("attack")) return false;

        let valid_attackers = game.board[this.plr.id].filter(m => this._canMinionAttack(m));

        return valid_attackers.length > 0;
    }

    /**
     * Returns if the ai can use their hero power
     *
     * @returns Can use hero power
     */
    _canHeroPower(): boolean {
        if (this.prevent.includes("hero power")) return false;

        let enoughMana = this.plr.mana >= this.plr.heroPowerCost;
        let canUse = this.plr.canUseHeroPower;

        let canHeroPower = enoughMana && canUse;

        this.prevent.push("hero power"); // The ai has already used their hero power that turn.

        return canHeroPower;
    }

    /**
     * Returns if there are any location cards the ai can use.
     */
    _canUseLocation(): boolean {
        if (this.prevent.includes("use")) return false;

        let valid_locations = game.board[this.plr.id].filter(m => m.type == "Location" && m.cooldown == 0 && !this.used_locations_this_turn.includes(m));

        return valid_locations.length > 0;
    }

    /**
     * Returns if the minion specified can attack
     *
     * @param m The minion to check
     *
     * @returns Can attack
     */
    _canMinionAttack(m: Card): boolean {
        let booleans = !m.sleepy && !m.frozen && !m.dormant;
        let numbers = m.getAttack() && m.attackTimes;

        return booleans && !!numbers;
    }

    /**
     * Returns if the minion specified is targettable
     *
     * @param m Minion to check
     *
     * @returns If it is targettable
     */
    _canTargetMinion(m: Card): boolean {
        let booleans = !m.dormant && !m.immune && !m.keywords.includes("Stealth");

        return booleans;
    }

    // ATTACKING
    /**
     * Finds all possible trades for the ai and returns them
     *
     * @returns `Perfect Trades`: [[attacker, target], ...], `Imperfect Trades`: [[attacker, target], ...]
     */
    _attackFindTrades(): [Card[][], Card[][]] {
        let perfect_trades: Card[][] = [];
        let imperfect_trades: Card[][] = [];

        let currboard = game.board[this.plr.id].filter(m => this._canMinionAttack(m));

        currboard.forEach(a => {
            let trades = [...perfect_trades, ...imperfect_trades];

            let score = this.analyzePositiveCard(a);
            if (score > game.config.AIProtectThreshold || trades.map(c => c[0]).includes(a)) return; // Don't attack with high-value minions.

            // If the card has the `sleepy` prop, it has the attackTimes prop too. TODO: Maybe have a different class for each card type.
            if (a.sleepy || a.attackTimes! <= 0) return;

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
     * @param player The player to score
     * @param board The board to check
     *
     * @returns Score
     */
    _scorePlayer(player: Player, board: ScoredCard[][]): number {
        let score = 0;

        board[player.id].forEach(m => {
            score += m.score;
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
     * @param board The board to check
     *
     * @returns Winner, Score
     */
    _findWinner(board: ScoredCard[][]): [Player, number] {
        let score = this._scorePlayer(this.plr, board);
        let opScore = this._scorePlayer(this.plr.getOpponent(), board);

        let winner = (score > opScore) ? this.plr : this.plr.getOpponent();
        let s = (winner == this.plr) ? score : opScore;

        return [winner, s];
    }

    /**
     * Returns if there is a taunt on the board
     *
     * @param return_taunts If the function should return the taunts it found, or just if there is a taunt. If this is true it will return the taunts it found.
     */
    _tauntExists(return_taunts: boolean = false): Card[] | boolean {
        // Todo: Make it only return Card[]
        let taunts = game.board[this.plr.getOpponent().id].filter(m => m.keywords.includes("Taunt"));

        if (return_taunts) return taunts;

        return taunts.length > 0;
    }

    /**
     * Does a trade
     *
     * @returns Attacker, Target
     */
    _attackTrade(): Card[] | null {
        let [perfect_trades, imperfect_trades] = this._attackFindTrades();

        let ret = null;
        if (perfect_trades.length > 0) ret = perfect_trades[0];
        else if (imperfect_trades.length > 0) ret = imperfect_trades[0];

        if (ret) this.history.push({"type": "trade", "data": [ret[0].name, ret[1].name]});

        return ret;
    }

    /**
     * Does a general attack
     *
     * @param board
     *
     * @returns Attacker, Target
     */
    _attackGeneral(board: ScoredCard[][]): (Target | -1)[] {
        let current_winner = this._findWinner(board);

        let ret = null;

        // Risky
        let op_score = this._scorePlayer(this.plr.getOpponent(), board);
        let risk_mode = current_winner[1] >= op_score + game.config.AIRiskThreshold // If the ai is winner by more than 'threshold' points, enable risk mode

        let taunts = this._tauntExists(); // If there are taunts, override risk mode

        if (risk_mode && !taunts) ret = this._attackGeneralRisky();
        else ret = this._attackGeneralMinion();

        if (ret.includes(-1)) return [-1, -1];

        // @ts-expect-error - `ret` here is this type, but ts doesn't know it. So this is a workaround
        let returned: Target[] = ret;

        this.history.push({"type": "attack", "data": [returned[0].name, returned[1].name]});

        // If the ai is not focusing on a minion, focus on the returned minion
        if (!this.focus && returned[1] instanceof Card) this.focus = returned[1];

        return returned;
    }

    /**
     * Does a risky attack.
     *
     * @returns Attacker, Target
     */
    _attackGeneralRisky(): (Target | -1)[] {
        // Only attack the enemy hero
        return [this._attackGeneralChooseAttacker(true), this.plr.getOpponent()];
    }

    /**
     * Chooses the attacker and target
     * 
     * Use the return value of this function to actually attack by passing it into `game.attack`
     *
     * @returns Attacker, Target
     */
    _attackGeneralMinion(): (Target | -1)[] {
        let target;

        // If the focused minion doesn't exist, select a new minion to focus
        if (!game.board[this.plr.getOpponent().id].find(a => a == this.focus)) this.focus = null;

        if (!this.focus || (this._tauntExists() && !this.focus.keywords.includes("Taunt"))) target = this._attackGeneralChooseTarget();
        else target = this.focus

        return [this._attackGeneralChooseAttacker(target instanceof Player), target];
    }

    /**
     * Choose a target for a general attack
     *
     * @returns Target | -1 (Go back)
     */
    _attackGeneralChooseTarget(): Target | -1 {
        let highest_score: (Target | number | null)[] = [null, -9999];

        let board = game.board[this.plr.getOpponent().id];

        // If there is a taunt, select that as the target
        let taunts = this._tauntExists(true);
        if (taunts instanceof Array && taunts.length > 0) return taunts[0];

        board = board.filter(m => this._canTargetMinion(m));

        board.forEach(m => {
            if (typeof highest_score[1] !== "number") highest_score[1] = -9999;

            let score = this.analyzePositiveCard(m);
            if (score < highest_score[1]) return;

            highest_score = [m, score];
        });

        let target = highest_score[0];

        // TODO: Does this never fail?
        if (!target) return this.plr.getOpponent();

        if (!target) {
            this.prevent.push("attack");
            return -1;
        }

        // Only -1 is a valid number
        if (typeof target === "number" && target != -1) return -1;

        return target;
    }

    /**
     * Choose an attacker for a general attack
     *
     * @param target_is_player If the target is a player
     *
     * @returns Attacker | -1 (Go back)
     */
    _attackGeneralChooseAttacker(target_is_player: boolean = false): Target | -1 {
        let lowest_score: (Target | number | null)[] = [null, 9999];

        let board = game.board[this.plr.id];
        board = board.filter(c => this._canMinionAttack(c));

        board.forEach(m => {
            if (typeof lowest_score[1] !== "number") lowest_score[1] = 9999;
            let score = this.analyzePositiveCard(m);

            if (score > lowest_score[1] || (score > game.config.AIProtectThreshold && !target_is_player)) return;

            if (m.sleepy || m.attackTimes! <= 0) return;
            if (target_is_player && !m.canAttackHero) return;

            lowest_score = [m, score];
        });

        let attacker = lowest_score[0];

        // TODO: Does this never fail?
        if (!attacker && (this.plr.attack > 0 && this.plr.canAttack)) return this.plr;

        if (!attacker) {
            this.prevent.push("attack");
            return -1;
        }

        // Only -1 is a valid number
        if (typeof attacker === "number" && attacker != -1) return -1;

        return attacker;
    }

    /**
     * Makes the ai attack
     *
     * @returns Attacker, Target
     */
    attack(): (Target | -1)[] {
        // Assign a score to all minions
        let board: ScoredCard[][] = game.board.map(m => {
            return m.map(c => {
                return {"card": c, "score": this.analyzePositiveCard(c)};
            });
        });

        let amount_of_trades = this._attackFindTrades().map(t => t.length).reduce((a, b) => a + b);

        // The ai should skip the trade stage if in risk mode
        let current_winner = this._findWinner(board);
        let op_score = this._scorePlayer(this.plr.getOpponent(), board);
        let risk_mode = current_winner[1] >= op_score + game.config.AIRiskThreshold // If the ai is winner by more than 'threshold' points, enable risk mode

        let taunts = this._tauntExists();
        if (taunts) return this._attackGeneral(board); // If there is a taunt, attack it before trading

        if (amount_of_trades > 0 && !risk_mode) return this._attackTrade() ?? [-1, -1];
        return this._attackGeneral(board);
    }

    /**
     * Makes the ai attack
     * 
     * @deprecated Use `AI.attack` instead.
     * 
     * @returns Attacker, Target
     */
    legacy_attack_1(): (Target | -1)[] { // This gets called if you set the ai attack model to 1
        let worst_minion: Card;
        let worst_score = 100000;
        
        game.board[this.plr.id].filter(m => !m.sleepy && !m.frozen && !m.dormant).forEach(m => {
            let score = this.analyzePositiveCard(m);

            if (score >= worst_score) return;

            worst_minion = m;
            worst_score = score;
        });

        // @ts-expect-error
        let attacker: Target | -1 = worst_minion;
        
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
        
        // @ts-expect-error
        let target: Target | null | -1 = best_minion;

        // If the AI has no minions to attack, attack the enemy hero
        if (!target) {
            if (!taunts.length && attacker && attacker.canAttackHero) target = this.plr.getOpponent();
            else {
                attacker = -1;
                target = -1;

                this.prevent.push("attack");
            }
        }
        if (!attacker && (this.plr.attack > 0 && this.plr.canAttack)) attacker = this.plr;

        let arr = [];
        let strbuilder = "";

        if (attacker instanceof Player) arr.push("P" + (attacker.id + 1));
        else if (attacker instanceof Card) {
            arr.push(attacker.name);
            strbuilder += worst_score + ", ";
        }
            
        if (target instanceof Player) arr.push("P" + (target.id + 1));
        else if (target instanceof Card) {
            arr.push(target.name);
            strbuilder += best_score;
        }

        this.history.push({"type": `attack, [${strbuilder}]`, "data": arr});

        return [attacker, target];
    }
    // -------------

    /**
     * Makes the ai select a target.
     * 
     * Gets automatically called by `Interactive.selectTarget`, so use that instead.
     * 
     * @param prompt The prompt to show the ai.
     * @param card The card that called this function
     * @param force_side The side the ai should be constrained to.
     * @param force_class The type of target the ai should be constrained to.
     * @param flags Some flags
     * 
     * @returns The target selected.
     */
    selectTarget(prompt: string, card: Card | null = null, force_side: SelectTargetAlignment | null = null, force_class: SelectTargetClass | null = null, flags: SelectTargetFlag[] = []): Target | false {
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
            this.history.push({"type": "selectTarget", "data": "0,1"});

            return false;
        }

        if (force_class && force_class == "hero") {
            let ret: Player | false = false;

            if (side == "self") ret = this.plr;
            else if (side == "enemy") ret = op;
            let _ret = (ret instanceof Player) ? "P" + (ret.id + 1) : ret;

            this.history.push({"type": "selectTarget", "data": _ret});

            return ret;
        }

        // The player has no minions, select their face
        if (game.board[sid].length <= 0) {
            let ret: Player | false = false;

            if (force_class != "minion") {
                let ret;
                if (sid === 0) ret = game.player1;
                else if (sid === 1) ret = game.player2;
                if (!ret) throw new Error("Player " + (sid + 1) + " not found");

                this.history.push({"type": "selectTarget", "data": "P" + (ret.id + 1)});
            }
            else this.history.push({"type": "selectTarget", "data": -1});

            return ret;
        }
        
        let best_minion: Card | false;
        let best_score = -100000;

        game.board[sid].forEach(m => {
            if (!this._canTargetMinion(m)) return;
            if ((card && card.type == "Spell" && m.keywords.includes("Elusive")) || m.type == "Location") return;
            
            let s = this.analyzePositiveCard(m);

            if (s <= best_score) return;

            best_minion = m;
            best_score = s;
        });

        // @ts-expect-error
        if (best_minion) {
            this.history.push({"type": "selectTarget", "data": `${best_minion.name},${best_score}`});

            return best_minion;
        }

        this.history.push({"type": "selectTarget", "data": -1});
        return false;
    }

    /**
     * Choose the "best" minion to discover.
     * 
     * @param cards The cards to choose from
     * 
     * @returns Result
     */
    discover(cards: CardLike[]): Card | null {
        let best_card: CardLike | null;
        let best_score = -100000;

        // Look for highest score
        cards.forEach(c => {
            if (!c.name) return; // Card-like is invalid

            let score = this.analyzePositiveCard(new Card(c.name, this.plr));

            if (score <= best_score) return;

            best_card = c;
            best_score = score;
        });

        // @ts-expect-error
        if (!best_card) return null;

        this.history.push({"type": "discover", "data": [best_card.name, best_score]});

        // `cards` can be a list of blueprints, so calling best_card.imperfectCopy is dangerous
        best_card = new Card(best_card.name, this.plr);

        return best_card;
    }

    /**
     * Choose the "best" card to dredge.
     * 
     * @param cards The cards to choose from
     * 
     * @returns Result
     */
    dredge(cards: Card[]): Card | null {
        let best_card: Card | null;
        let best_score = -100000;

        // Look for highest score
        cards.forEach(c => {
            let score = this.analyzePositiveCard(c);

            if (score <= best_score) return;

            best_card = c;
            best_score = score;
        });

        // @ts-expect-error
        if (!best_card) return null;

        let name = best_card ? best_card.name : null

        this.history.push({"type": "dredge", "data": [name, best_score]});
        return best_card;
    }

    /**
     * Choose the "best" option from `options`
     * 
     * @param options The options the ai can pick from
     *
     * @returns The index of the question chosen
     */
    chooseOne(options: string[]): number | null {
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
 
        this.history.push({"type": "chooseOne", "data": [best_choice, best_score]});

        return best_choice;
    }

    /**
     * Choose the "best" answer from `options`
     *
     * @param prompt The prompt to show to the ai
     * @param options The options the ai can pick from
     *
     * @returns The index of the option chosen + 1
     */
    question(prompt: string, options: string[]): number | null {
        let best_choice = null;
        let best_score = -100000;

        options.forEach((v, i) => {
            let score = this.analyzePositive(v);

            if (score <= best_score) return;

            best_choice = i;
            best_score = score;
        });

        this.history.push({"type": `question: ${prompt}`, "data": [best_choice, best_score]});

        if (!best_choice) return null;

        return best_choice + 1;
    }

    /**
     * Choose yes or no based on the prompt
     *
     * @param prompt The prompt to show to the ai
     *
     * @returns `true` if "Yes", `false` if "No"
     */
    yesNoQuestion(prompt: string): boolean {
        let score = this.analyzePositive(prompt);
        let ret;

        if (score > 0) ret = true;
        else ret = false;

        this.history.push({"type": "yesNoQuestion", "data": [prompt, ret]});

        return ret;
    }

    /**
     * Returns if the ai wants `card` to be traded
     *
     * @param card The card to check
     *
     * @returns If the card should be traded
     */
    trade(card: Card): boolean {
        if (this.plr.deck.length <= 1) return false; // If the ai doesn't have any cards to trade into, don't trade the card.
        if (this.plr.mana < 1) return false; // If the ai can't afford to trade, don't trade the card

        let score = this.analyzePositiveCard(card);

        let ret = score <= game.config.AITradeThreshold;

        this.history.push({"type": "trade", "data": [card.name, ret, score]});

        return ret;
    }

    /**
     * Returns the list of cards the ai wants to mulligan.
     * 
     * @returns The indexes of the cards to mulligan. Look in `Interact.mulligan` for more details.
     */
    mulligan(): string {
        let to_mulligan = "";

        let _scores = "(";

        this.plr.hand.forEach(c => {
            if (c.name == "The Coin") return;

            let score = this.analyzePositiveCard(c);

            if (score < game.config.AIMulliganThreshold) to_mulligan += (this.plr.hand.indexOf(c) + 1).toString();

            _scores += `${c.name}:${score}, `;
        });

        _scores = _scores.slice(0, -2) + ")";

        this.history.push({"type": `mulligan (T${game.config.AIMulliganThreshold})`, "data": [to_mulligan, _scores]});

        return to_mulligan;
    }

    /**
     * Analyze a string and return a score based on how "positive" the ai thinks it is
     *
     * @param str The string to analyze
     * @param context Enable context analysis
     * 
     * @returns The score the string gets
     */
    analyzePositive(str: string, context: boolean = true): number {
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
     * @param c The card to analyze
     *
     * @returns The score
     */
    analyzePositiveCard(c: Card): number {
        let score = this.analyzePositive(c.desc || "");

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
