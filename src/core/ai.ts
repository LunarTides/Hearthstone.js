/**
 * The AI
 * @module AI
 */
import { Card, Player } from "../internal.js";
import { AICalcMoveOption, AIHistory, CardLike, ScoredCard, SelectTargetAlignment, SelectTargetClass, SelectTargetFlag, Target } from "../types.js";

// TODO: Ai gets stuck in infinite loop when using cathedral of atonement (location) | shadowcloth needle (0 attack wpn) | that minion has no attack.

/**
 * The AI class.
 */
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
    cardsPlayedThisTurn: Card[] = [];

    /**
     * The locations that the AI has used this turn
     */
    usedLocationsThisTurn: Card[] = [];

    /**
     * The card that the AI has focused, and is trying to kill
     */
    focus: Card | null = null;

    /**
     * Sentiment-based AI
     */
    constructor(plr: Player) {
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
        let bestMove: AICalcMoveOption | undefined;
        let bestScore = -100000;

        // Look for highest score
        this.plr.hand.forEach(c => {
            const score = this.analyzePositiveCard(c);

            if (score <= bestScore || c.cost > this.plr.mana || this.cardsPlayedThisTurn.includes(c)) return;

            // If the card is a minion and the player doesn't have the board space to play it, ignore the card
            if (game.functions.canBeOnBoard(c) && game.board[this.plr.id].length >= game.config.general.maxBoardSpace) return;

            // Prevent the ai from playing the same card they returned from when selecting a target
            let r = false;

            this.history.forEach((h, i) => {
                if (h.data instanceof Array && h.data[1] === "0,1" && this.history[i - 1].data[0] == c.name) r = true;
            });
            if (r) return;

            bestMove = c;
            bestScore = score;
        });

        // If a card wasn't chosen
        if (!bestMove) {
            // See if can hero power
            if (this._canHeroPower()) bestMove = "hero power";

            // See if can attack
            else if (this._canAttack()) bestMove = "attack";

            // See if has location
            else if (this._canUseLocation()) bestMove = "use";

            else bestMove = "end";

            this.history.push({"type": "calcMove", "data": bestMove});
        }

        else if (bestMove instanceof Card) {
            this.history.push({"type": "calcMove", "data": [bestMove.name, bestScore]});

            this.cardsPlayedThisTurn.push(bestMove);
        }

        if (bestMove == "end") {
            this.history.forEach((h, i) => {
                if (h instanceof Array && h[0] == "selectTarget" && h[1] == "0,1") this.history[i].data = null;
            });

            this.cardsPlayedThisTurn = [];
            this.usedLocationsThisTurn = [];
            this.prevent = [];
        }

        return bestMove;
    }

    /**
     * Checks if there are any minions that can attack on the ai's board
     *
     * @returns Can attack
     */
    private _canAttack(): boolean {
        if (this.prevent.includes("attack")) return false;

        const validAttackers = game.board[this.plr.id].filter(m => this._canMinionAttack(m));

        return validAttackers.length > 0;
    }

    /**
     * Returns if the ai can use their hero power
     *
     * @returns Can use hero power
     */
    private _canHeroPower(): boolean {
        if (this.prevent.includes("hero power")) return false;

        const enoughMana = this.plr.mana >= this.plr.heroPowerCost;
        const canUse = this.plr.canUseHeroPower;

        const canHeroPower = enoughMana && canUse;

        // The ai has already used their hero power that turn.
        this.prevent.push("hero power");

        return canHeroPower;
    }

    /**
     * Returns if there are any location cards the ai can use.
     */
    private _canUseLocation(): boolean {
        if (this.prevent.includes("use")) return false;

        const validLocations = game.board[this.plr.id].filter(m => m.type == "Location" && m.cooldown == 0 && !this.usedLocationsThisTurn.includes(m));

        return validLocations.length > 0;
    }

    /**
     * Returns if the minion specified can attack
     *
     * @param m The minion to check
     *
     * @returns Can attack
     */
    private _canMinionAttack(m: Card): boolean {
        const booleans = !m.sleepy && !m.frozen && !m.dormant;
        const numbers = m.getAttack() && m.attackTimes;

        return booleans && !!numbers;
    }

    /**
     * Returns if the minion specified is targettable
     *
     * @param m Minion to check
     *
     * @returns If it is targettable
     */
    private _canTargetMinion(m: Card): boolean {
        const booleans = !m.dormant && !m.immune && !m.keywords.includes("Stealth");

        return booleans;
    }

    // ATTACKING
    /**
     * Finds all possible trades for the ai and returns them
     *
     * @returns `Perfect Trades`: [[attacker, target], ...], `Imperfect Trades`: [[attacker, target], ...]
     */
    private _attackFindTrades(): [Card[][], Card[][]] {
        const perfectTrades: Card[][] = [];
        const imperfectTrades: Card[][] = [];

        const currboard = game.board[this.plr.id].filter(m => this._canMinionAttack(m));

        currboard.forEach(a => {
            let trades = [...perfectTrades, ...imperfectTrades];

            const score = this.analyzePositiveCard(a);

            // Don't attack with high-value minions.
            if (score > game.config.ai.protectThreshold || trades.map(c => c[0]).includes(a)) return;

            // If the card has the `sleepy` prop, it has the attackTimes prop too.
            if (a.sleepy || a.attackTimes! <= 0) return;

            const opboard = game.board[this.plr.getOpponent().id].filter(m => this._canTargetMinion(m));

            opboard.forEach(t => {
                trades = [...perfectTrades, ...imperfectTrades];
                if (trades.map(c => c[1]).includes(t)) return;

                const score = this.analyzePositiveCard(t);

                // Don't waste resources attacking useless targets.
                if (score < game.config.ai.ignoreThreshold) return;

                if (a.getAttack() == t.getHealth()) perfectTrades.push([a, t]);
                else if (a.getAttack() > t.getHealth()) imperfectTrades.push([a, t]);
            });
        });

        return [perfectTrades, imperfectTrades];
    }

    /**
     * Returns a score for the player specified based on how good their position is.
     *
     * @param player The player to score
     * @param board The board to check
     *
     * @returns Score
     */
    private _scorePlayer(player: Player, board: ScoredCard[][]): number {
        let score = 0;

        board[player.id].forEach(m => {
            score += m.score;
        });

        Object.entries(player).forEach(f => {
            const [key, val] = f;

            const i = ["health", "maxHealth", "armor", "emptyMana"];
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
    private _findWinner(board: ScoredCard[][]): [Player, number] {
        const score = this._scorePlayer(this.plr, board);
        const opScore = this._scorePlayer(this.plr.getOpponent(), board);

        const winner = (score > opScore) ? this.plr : this.plr.getOpponent();
        const s = (winner == this.plr) ? score : opScore;

        return [winner, s];
    }

    /**
     * Returns if there is a taunt on the board
     *
     * @param returnTaunts If the function should return the taunts it found, or just if there is a taunt. If this is true it will return the taunts it found.
     */
    private _tauntExists(returnTaunts: boolean = false): Card[] | boolean {
        // TODO: Make it only return Card[]
        const taunts = game.board[this.plr.getOpponent().id].filter(m => m.keywords.includes("Taunt"));

        if (returnTaunts) return taunts;

        return taunts.length > 0;
    }

    /**
     * Does a trade
     *
     * @returns Attacker, Target
     */
    private _attackTrade(): Card[] | null {
        const [perfectTrades, imperfectTrades] = this._attackFindTrades();

        let ret = null;
        if (perfectTrades.length > 0) ret = perfectTrades[0];
        else if (imperfectTrades.length > 0) ret = imperfectTrades[0];

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
    private _attackGeneral(board: ScoredCard[][]): (Target | -1)[] {
        const currentWinner = this._findWinner(board);

        let ret = null;

        // Risky
        const opScore = this._scorePlayer(this.plr.getOpponent(), board);

        // If the ai is winner by more than 'threshold' points, enable risk mode
        const riskMode = currentWinner[1] >= opScore + game.config.ai.riskThreshold;

        // If there are taunts, override risk mode
        const taunts = this._tauntExists();

        if (riskMode && !taunts) ret = this._attackGeneralRisky();
        else ret = this._attackGeneralMinion();

        if (ret.includes(-1)) return [-1, -1];

        const returned: Target[] = ret as Target[];

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
    private _attackGeneralRisky(): (Target | -1)[] {
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
    private _attackGeneralMinion(): (Target | -1)[] {
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
    private _attackGeneralChooseTarget(): Target | -1 {
        let highestScore: (Target | number | null)[] = [null, -9999];

        let board = game.board[this.plr.getOpponent().id];

        // If there is a taunt, select that as the target
        const taunts = this._tauntExists(true);
        if (taunts instanceof Array && taunts.length > 0) return taunts[0];

        board = board.filter(m => this._canTargetMinion(m));

        board.forEach(m => {
            if (typeof highestScore[1] !== "number") highestScore[1] = -9999;

            const score = this.analyzePositiveCard(m);
            if (score < highestScore[1]) return;

            highestScore = [m, score];
        });

        const target = highestScore[0];

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
     * @param targetIsPlayer If the target is a player
     *
     * @returns Attacker | -1 (Go back)
     */
    private _attackGeneralChooseAttacker(targetIsPlayer: boolean = false): Target | -1 {
        let lowestScore: (Target | number | null)[] = [null, 9999];

        let board = game.board[this.plr.id];
        board = board.filter(c => this._canMinionAttack(c));

        board.forEach(m => {
            if (typeof lowestScore[1] !== "number") lowestScore[1] = 9999;
            const score = this.analyzePositiveCard(m);

            if (score > lowestScore[1] || (score > game.config.ai.protectThreshold && !targetIsPlayer)) return;

            if (m.sleepy || m.attackTimes! <= 0) return;
            if (targetIsPlayer && !m.canAttackHero) return;

            lowestScore = [m, score];
        });

        const attacker = lowestScore[0];

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
        const board: ScoredCard[][] = game.board.map(m => {
            return m.map(c => {
                return {"card": c, "score": this.analyzePositiveCard(c)};
            });
        });

        const amountOfTrades = this._attackFindTrades().map(t => t.length).reduce((a, b) => a + b);

        // The ai should skip the trade stage if in risk mode
        const currentWinner = this._findWinner(board);
        const opScore = this._scorePlayer(this.plr.getOpponent(), board);

        // If the ai is winner by more than 'threshold' points, enable risk mode
        const riskMode = currentWinner[1] >= opScore + game.config.ai.riskThreshold;

        const taunts = this._tauntExists();

        // If there is a taunt, attack it before trading
        if (taunts) return this._attackGeneral(board);

        if (amountOfTrades > 0 && !riskMode) return this._attackTrade() ?? [-1, -1];
        return this._attackGeneral(board);
    }

    /**
     * Makes the ai attack.
     * This gets called if you set the ai attack model to 1.
     * 
     * @deprecated Use `AI.attack` instead.
     * 
     * @returns Attacker, Target
     */
    legacyAttack1(): (Target | null)[] { 
        let worstMinion: Card | null = null;
        let worstScore = 100000;
        
        game.board[this.plr.id].filter(m => !m.sleepy && !m.frozen && !m.dormant).forEach(m => {
            const score = this.analyzePositiveCard(m);

            if (score >= worstScore) return;

            worstMinion = m;
            worstScore = score;
        });

        if (!worstMinion) {
            this.history.push({"type": `attack, [null, null]`, "data": [-1, -1]});
            this.prevent.push("attack");
            return [null, null];
        }

        let attacker: Target = worstMinion;
        
        let targets

        let bestMinion: Card | null = null;
        let bestScore = -100000;

        // Check if there is a minion with taunt
        const taunts = game.board[this.plr.getOpponent().id].filter(m => m.keywords.includes("Taunt"));
        if (taunts.length > 0) targets = taunts.filter(m => !m.immune && !m.dormant);
        else targets = game.board[this.plr.getOpponent().id].filter(m => !m.immune && !m.dormant);

        targets.forEach(m => {
            const score = this.analyzePositiveCard(m);

            if (score <= bestScore) return;

            bestMinion = m;
            bestScore = score;
        });
        
        let target: Target | null = bestMinion;

        // If the AI has no minions to attack, attack the enemy hero
        if (!target) {
            if (!taunts.length && attacker && ((attacker as Target).classType === "Player" || (attacker as Card).canAttackHero)) target = this.plr.getOpponent();
            else {
                this.history.push({"type": `attack, [null, null]`, "data": [-1, -1]});
                this.prevent.push("attack");
                return [null, null];
            }
        }
        if (!attacker && (this.plr.attack > 0 && this.plr.canAttack)) attacker = this.plr as Target;

        const arr = [];
        let strbuilder = "";

        if (attacker instanceof Player) arr.push("P" + (attacker.id + 1));
        else if (attacker instanceof Card) {
            arr.push(attacker.name);
            strbuilder += worstScore + ", ";
        }
            
        if (target instanceof Player) arr.push("P" + (target.id + 1));
        else if ((target as Target) instanceof Card) {
            arr.push((target as Card).name);
            strbuilder += bestScore;
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
     * @param forceSide The side the ai should be constrained to.
     * @param forceClass The type of target the ai should be constrained to.
     * @param flags Some flags
     * 
     * @returns The target selected.
     */
    selectTarget(prompt: string, card: Card | null = null, forceSide: SelectTargetAlignment, forceClass: SelectTargetClass, flags: SelectTargetFlag[] = []): Target | false {
        if (flags.includes("allowLocations") && forceClass != "hero") {
            const locations = game.board[this.plr.id].filter(m => m.type == "Location" && m.cooldown == 0 && !this.usedLocationsThisTurn.includes(m));
            this.usedLocationsThisTurn.push(locations[0]);

            if (locations.length > 0) return locations[0];
        }

        const op = this.plr.getOpponent();
        const id = this.plr.id;

        let side = null;

        const score = this.analyzePositive(prompt, false);

        if (score > 0) side = "self";
        else if (score < 0) side = "enemy";

        if (forceSide !== "any") side = forceSide;

        const sid = (side == "self") ? id : op.id;

        if (game.board[sid].length <= 0 && forceClass == "minion") {
            this.history.push({"type": "selectTarget", "data": "0,1"});

            return false;
        }

        if (forceClass == "hero") {
            let ret: Player | false = false;

            if (side == "self") ret = this.plr;
            else if (side == "enemy") ret = op;
            const _ret = (ret instanceof Player) ? "P" + (ret.id + 1) : ret;

            this.history.push({"type": "selectTarget", "data": _ret});

            return ret;
        }

        // The player has no minions, select their face
        if (game.board[sid].length <= 0) {
            const ret: Player | false = false;

            if (forceClass === "minion") this.history.push({"type": "selectTarget", "data": -1});
            else {
                let ret
                if (sid === 0) ret = game.player1;
                else if (sid === 1) ret = game.player2;
                if (!ret) throw new Error("Player " + (sid + 1) + " not found");

                this.history.push({"type": "selectTarget", "data": "P" + (ret.id + 1)});
            }

            return ret;
        }
        
        let bestMinion: Card | undefined;
        let bestScore = -100000;

        game.board[sid].forEach(m => {
            if (!this._canTargetMinion(m)) return;
            if ((card && card.type == "Spell" && m.keywords.includes("Elusive")) || m.type == "Location") return;
            
            const s = this.analyzePositiveCard(m);

            if (s <= bestScore) return;

            bestMinion = m;
            bestScore = s;
        });

        if (bestMinion) {
            this.history.push({"type": "selectTarget", "data": `${bestMinion.name},${bestScore}`});

            return bestMinion;
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
        let bestCard: CardLike | undefined;
        let bestScore = -100000;

        // Look for highest score
        cards.forEach(c => {
            // Card-like is invalid
            if (!c.name) return;

            const score = this.analyzePositiveCard(new Card(c.name, this.plr));

            if (score <= bestScore) return;

            bestCard = c;
            bestScore = score;
        });

        if (!bestCard) return null;

        this.history.push({"type": "discover", "data": [bestCard.name, bestScore]});

        // `cards` can be a list of blueprints, so calling bestCard.imperfectCopy is dangerous
        bestCard = new Card(bestCard.name, this.plr);

        return bestCard;
    }

    /**
     * Choose the "best" card to dredge.
     * 
     * @param cards The cards to choose from
     * 
     * @returns Result
     */
    dredge(cards: Card[]): Card | null {
        let bestCard: Card | undefined;
        let bestScore = -100000;

        // Look for highest score
        cards.forEach(c => {
            const score = this.analyzePositiveCard(c);

            if (score <= bestScore) return;

            bestCard = c;
            bestScore = score;
        });

        if (!bestCard) return null;

        const name = bestCard ? bestCard.name : null

        this.history.push({"type": "dredge", "data": [name, bestScore]});
        return bestCard;
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
        let bestChoice = null;
        let bestScore = -100000;
 
        // Look for highest score
        options.forEach((c, i) => {
            const score = this.analyzePositive(c);

            if (score <= bestScore) return;

            bestChoice = i;
            bestScore = score;
        });
 
        this.history.push({"type": "chooseOne", "data": [bestChoice, bestScore]});

        return bestChoice;
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
        let bestChoice = null;
        let bestScore = -100000;

        options.forEach((v, i) => {
            const score = this.analyzePositive(v);

            if (score <= bestScore) return;

            bestChoice = i;
            bestScore = score;
        });

        this.history.push({"type": `question: ${prompt}`, "data": [bestChoice, bestScore]});

        if (!bestChoice) return null;

        return bestChoice + 1;
    }

    /**
     * Choose yes or no based on the prompt
     *
     * @param prompt The prompt to show to the ai
     *
     * @returns `true` if "Yes", `false` if "No"
     */
    yesNoQuestion(prompt: string): boolean {
        const score = this.analyzePositive(prompt);
        let ret

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
        // If the ai doesn't have any cards to trade into, don't trade the card.
        if (this.plr.deck.length <= 1) return false;

        // If the ai can't afford to trade, don't trade the card
        if (this.plr.mana < 1) return false;

        const score = this.analyzePositiveCard(card);

        const ret = score <= game.config.ai.tradeThreshold;

        this.history.push({"type": "trade", "data": [card.name, ret, score]});

        return ret;
    }

    /**
     * Returns the list of cards the ai wants to mulligan.
     * 
     * @returns The indexes of the cards to mulligan. Look in `Interact.mulligan` for more details.
     */
    mulligan(): string {
        let toMulligan = "";
        let scores = "(";

        this.plr.hand.forEach(c => {
            if (c.name == "The Coin") return;

            const score = this.analyzePositiveCard(c);

            if (score < game.config.ai.mulliganThreshold) toMulligan += (this.plr.hand.indexOf(c) + 1).toString();

            scores += `${c.name}:${score}, `;
        });

        scores = scores.slice(0, -2) + ")";

        this.history.push({"type": `mulligan (T${game.config.ai.mulliganThreshold})`, "data": [toMulligan, scores]});

        return toMulligan;
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
        if (context) context = game.config.ai.contextAnalysis;
        let score = 0;

        str.toLowerCase().split(/[^a-z0-9 ]/).forEach(i => {
            i = i.trim();

            i.split(" ").forEach(s => {
                // Filter out any characters not in the alphabet
                s = s.replace(/[^a-z]/g, "");
                let ret = false;

                Object.entries(game.config.ai.sentiments).forEach(v => {
                    if (ret) return;

                    Object.entries(v[1]).forEach(k => {
                        if (ret) return;

                        // Remove the last "s" or "d" in order to account for plurals 
                        const k0 = k[0].replace(/^(.*)[sd]$/, "$1");
                        if (!new RegExp(k[0]).test(s) && !new RegExp(k0).test(s)) return;

                        // If the sentiment is "positive", add to the score. If it is "negative", subtract from the score.
                        const opponentTest = /enemy|enemies|opponent/;
                        let pos = k[1];
                        if (context && opponentTest.test(i)) pos = -pos;
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
        let score = this.analyzePositive(c.text || "");

        if (c.stats) score += (c.getAttack() + c.getHealth()) * game.config.ai.statsBias;

        // If the spell value is 4 then it the same value as a 2/2 minion
        else score += game.config.ai.spellValue * game.config.ai.statsBias;
        score -= c.cost * game.config.ai.costBias;

        c.keywords.forEach(() => score += game.config.ai.keywordValue);
        Object.values(c).forEach(c => {
            if (c instanceof Array && c[0] instanceof Function) score += game.config.ai.abilityValue;
        });

        return score;
    }
}
