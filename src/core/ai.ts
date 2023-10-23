/**
 * The AI
 * @module AI
 */
import { Card, Player } from '../internal.js';
import { type AiCalcMoveOption, type AiHistory, type CardLike, type ScoredCard, type SelectTargetAlignment, type SelectTargetClass, type SelectTargetFlag, type Target } from '../types.js';

// TODO: Ai gets stuck in infinite loop when using cathedral of atonement (location) | shadowcloth needle (0 attack wpn) | that minion has no attack.

/**
 * The AI class.
 */
export class Ai {
    /**
     * The player that the AI is playing for
     */
    // eslint-disable-next-line @typescript-eslint/parameter-properties
    plr: Player;

    /**
     * The history of the AI. Also known as its "logs".
     */
    history: AiHistory[] = [];

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
    focus: Card | undefined;

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
    // eslint-disable-next-line complexity
    calcMove(): AiCalcMoveOption {
        let bestMove: AiCalcMoveOption | undefined;
        let bestScore = -100_000;

        // Look for highest score
        for (const c of this.plr.hand) {
            const score = this.analyzePositiveCard(c);

            if (score <= bestScore || c.cost > this.plr.mana || this.cardsPlayedThisTurn.includes(c)) {
                continue;
            }

            // If the card is a minion and the player doesn't have the board space to play it, ignore the card
            if (c.canBeOnBoard() && game.board[this.plr.id].length >= game.config.general.maxBoardSpace) {
                continue;
            }

            // Prevent the ai from playing the same card they returned from when selecting a target
            let r = false;

            for (const [i, h] of this.history.entries()) {
                if (Array.isArray(h.data) && h.data[1] === '0,1' && this.history[i - 1].data[0] === c.name) {
                    r = true;
                }
            }

            if (r) {
                continue;
            }

            bestMove = c;
            bestScore = score;
        }

        // If a card wasn't chosen
        if (!bestMove) {
            if (this._canHeroPower()) {
                bestMove = 'hero power';
            } else if (this._canAttack()) {
                bestMove = 'attack';
            } else if (this._canUseLocation()) {
                bestMove = 'use';
            } else {
                bestMove = 'end';
            }

            this.history.push({ type: 'calcMove', data: bestMove });
        } else if (bestMove instanceof Card) {
            this.history.push({ type: 'calcMove', data: [bestMove.name, bestScore] });

            this.cardsPlayedThisTurn.push(bestMove);
        }

        if (bestMove === 'end') {
            for (const [i, h] of this.history.entries()) {
                if (Array.isArray(h) && h[0] === 'selectTarget' && h[1] === '0,1') {
                    this.history[i].data = null;
                }
            }

            this.cardsPlayedThisTurn = [];
            this.usedLocationsThisTurn = [];
            this.prevent = [];
        }

        return bestMove;
    }

    /**
     * Makes the ai attack
     *
     * @returns Attacker, Target
     */
    attack(): Array<Target | -1> {
        // Assign a score to all minions
        const board: ScoredCard[][] = game.board.map(m => m.map(c => ({ card: c, score: this.analyzePositiveCard(c) })));

        const amountOfTrades = this._attackFindTrades().map(t => t.length).reduce((a, b) => a + b);

        // The ai should skip the trade stage if in risk mode
        const currentWinner = this._findWinner(board);
        const opScore = this._scorePlayer(this.plr.getOpponent(), board);

        // If the ai is winner by more than 'threshold' points, enable risk mode
        const riskMode = currentWinner[1] >= opScore + game.config.ai.riskThreshold;

        const taunts = this._findTaunts();

        // If there is a taunt, attack it before trading
        if (taunts.length > 0) {
            return this._attackGeneral(board);
        }

        if (amountOfTrades > 0 && !riskMode) {
            return this._attackTrade() ?? [-1, -1];
        }

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
    legacyAttack1(): Array<Target | undefined> {
        let worstMinion: Card | undefined;
        let worstScore = 100_000;

        for (const m of game.board[this.plr.id].filter(m => !m.sleepy && !m.hasKeyword('Frozen') && !m.hasKeyword('Dormant'))) {
            const score = this.analyzePositiveCard(m);

            if (score >= worstScore) {
                continue;
            }

            worstMinion = m;
            worstScore = score;
        }

        if (!worstMinion) {
            this.history.push({ type: 'attack, [null, null]', data: [-1, -1] });
            this.prevent.push('attack');
            return [undefined, undefined];
        }

        let attacker: Target = worstMinion;

        let bestMinion: Card | undefined;
        let bestScore = -100_000;

        // Check if there is a minion with taunt
        const taunts = game.board[this.plr.getOpponent().id].filter(m => m.hasKeyword('Taunt'));
        const targets = taunts.length > 0 ? taunts.filter(m => !m.hasKeyword('Immune') && !m.hasKeyword('Dormant')) : game.board[this.plr.getOpponent().id].filter(m => !m.hasKeyword('Immune') && !m.hasKeyword('Dormant'));

        for (const m of targets) {
            const score = this.analyzePositiveCard(m);

            if (score <= bestScore) {
                continue;
            }

            bestMinion = m;
            bestScore = score;
        }

        let target: Target | undefined = bestMinion;

        // If the AI has no minions to attack, attack the enemy hero
        if (!target) {
            if (taunts.length === 0 && attacker && ((attacker as Target) instanceof Player || (attacker).canAttackHero)) {
                target = this.plr.getOpponent();
            } else {
                this.history.push({ type: 'attack, [null, null]', data: [-1, -1] });
                this.prevent.push('attack');
                return [undefined, undefined];
            }
        }

        if (!attacker && (this.plr.attack > 0 && this.plr.canAttack)) {
            attacker = this.plr as Target;
        }

        const array = [];
        let strbuilder = '';

        if (attacker instanceof Player) {
            array.push('P' + (attacker.id + 1));
        } else if (attacker instanceof Card) {
            array.push(attacker.name);
            strbuilder += worstScore + ', ';
        }

        if (target instanceof Player) {
            array.push('P' + (target.id + 1));
        } else if ((target as Target) instanceof Card) {
            array.push((target).name);
            strbuilder += bestScore;
        }

        this.history.push({ type: `attack, [${strbuilder}]`, data: array });

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
    // eslint-disable-next-line complexity
    selectTarget(prompt: string, card: Card | undefined, forceSide: SelectTargetAlignment, forceClass: SelectTargetClass, flags: SelectTargetFlag[] = []): Target | false {
        if (flags.includes('allowLocations') && forceClass !== 'hero') {
            const locations = game.board[this.plr.id].filter(m => m.type === 'Location' && m.cooldown === 0 && !this.usedLocationsThisTurn.includes(m));
            this.usedLocationsThisTurn.push(locations[0]);

            if (locations.length > 0) {
                return locations[0];
            }
        }

        const op = this.plr.getOpponent();
        const { id } = this.plr;

        let side = null;

        const score = this.analyzePositive(prompt, false);

        if (score > 0) {
            side = 'self';
        } else if (score < 0) {
            side = 'enemy';
        }

        if (forceSide !== 'any') {
            side = forceSide;
        }

        const sid = (side === 'self') ? id : op.id;

        if (game.board[sid].length <= 0 && forceClass === 'minion') {
            this.history.push({ type: 'selectTarget', data: '0,1' });

            return false;
        }

        if (forceClass === 'hero') {
            let returnValue: Player | false = false;

            if (side === 'self') {
                returnValue = this.plr;
            } else if (side === 'enemy') {
                returnValue = op;
            }

            const _returnValue = (returnValue instanceof Player) ? 'P' + (returnValue.id + 1) : returnValue;

            this.history.push({ type: 'selectTarget', data: _returnValue });

            return returnValue;
        }

        // The player has no minions, select their face
        if (game.board[sid].length <= 0) {
            const returnValue: Player | false = false;

            if (forceClass === 'minion') {
                this.history.push({ type: 'selectTarget', data: -1 });
            } else {
                let returnValue_;
                if (sid === 0) {
                    returnValue_ = game.player1;
                } else if (sid === 1) {
                    returnValue_ = game.player2;
                }

                if (!returnValue_) {
                    throw new Error('Player ' + (sid + 1) + ' not found');
                }

                this.history.push({ type: 'selectTarget', data: 'P' + (returnValue_.id + 1) });
            }

            return returnValue;
        }

        let bestMinion: Card | undefined;
        let bestScore = -100_000;

        for (const m of game.board[sid]) {
            if (!this._canTargetMinion(m)) {
                continue;
            }

            if ((card && card.type === 'Spell' && m.hasKeyword('Elusive')) ?? m.type === 'Location') {
                continue;
            }

            const s = this.analyzePositiveCard(m);

            if (s <= bestScore) {
                continue;
            }

            bestMinion = m;
            bestScore = s;
        }

        if (bestMinion) {
            this.history.push({ type: 'selectTarget', data: `${bestMinion.name},${bestScore}` });

            return bestMinion;
        }

        this.history.push({ type: 'selectTarget', data: -1 });
        return false;
    }

    /**
     * Choose the "best" minion to discover.
     *
     * @param cards The cards to choose from
     *
     * @returns Result
     */
    discover(cards: CardLike[]): Card | undefined {
        let bestCard: CardLike | undefined;
        let bestScore = -100_000;

        // Look for highest score
        for (const c of cards) {
            // Card-like is invalid
            if (!c.name) {
                continue;
            }

            const score = this.analyzePositiveCard(new Card(c.name, this.plr));

            if (score <= bestScore) {
                continue;
            }

            bestCard = c;
            bestScore = score;
        }

        if (!bestCard) {
            return undefined;
        }

        this.history.push({ type: 'discover', data: [bestCard.name, bestScore] });

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
    dredge(cards: Card[]): Card | undefined {
        let bestCard: Card | undefined;
        let bestScore = -100_000;

        // Look for highest score
        for (const c of cards) {
            const score = this.analyzePositiveCard(c);

            if (score <= bestScore) {
                continue;
            }

            bestCard = c;
            bestScore = score;
        }

        if (!bestCard) {
            return undefined;
        }

        const name = bestCard ? bestCard.name : null;

        this.history.push({ type: 'dredge', data: [name, bestScore] });
        return bestCard;
    }

    /**
     * Choose the "best" option from `options`
     *
     * @param options The options the ai can pick from
     *
     * @returns The index of the question chosen
     */
    chooseOne(options: string[]): number | undefined {
        // I know this is a bad solution
        // "Deal 2 damage to a minion; or Restore 5 Health."
        // ^^^^^ It will always choose to restore 5 health, since it sees deal 2 damage as bad but oh well, future me problem.
        // ^^^^^ Update 29/05/23  TODO: Fix this
        let bestChoice;
        let bestScore = -100_000;

        // Look for highest score
        for (const [i, c] of options.entries()) {
            const score = this.analyzePositive(c);

            if (score <= bestScore) {
                continue;
            }

            bestChoice = i;
            bestScore = score;
        }

        this.history.push({ type: 'chooseOne', data: [bestChoice, bestScore] });

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
    question(prompt: string, options: string[]): number | undefined {
        let bestChoice = null;
        let bestScore = -100_000;

        for (const [i, v] of options.entries()) {
            const score = this.analyzePositive(v);

            if (score <= bestScore) {
                continue;
            }

            bestChoice = i;
            bestScore = score;
        }

        this.history.push({ type: `question: ${prompt}`, data: [bestChoice, bestScore] });

        if (!bestChoice) {
            return undefined;
        }

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
        const returnValue = score > 0;

        this.history.push({ type: 'yesNoQuestion', data: [prompt, returnValue] });

        return returnValue;
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
        if (this.plr.deck.length <= 1) {
            return false;
        }

        // If the ai can't afford to trade, don't trade the card
        if (this.plr.mana < 1) {
            return false;
        }

        const score = this.analyzePositiveCard(card);

        const returnValue = score <= game.config.ai.tradeThreshold;

        this.history.push({ type: 'trade', data: [card.name, returnValue, score] });

        return returnValue;
    }

    /**
     * Returns if the ai wants `card` to be forged
     *
     * @param card The card to check
     *
     * @returns If the card should be forged
     */
    forge(card: Card): boolean {
        // Always forge the card if the ai has enough mana
        const returnValue = !(this.plr.mana < 2);

        this.history.push({ type: 'forge', data: [card.name, returnValue] });
        return returnValue;
    }

    /**
     * Returns the list of cards the ai wants to mulligan.
     *
     * @returns The indexes of the cards to mulligan. Look in `Interact.mulligan` for more details.
     */
    mulligan(): string {
        let toMulligan = '';
        let scores = '(';

        for (const c of this.plr.hand) {
            if (c.name === 'The Coin') {
                continue;
            }

            const score = this.analyzePositiveCard(c);

            if (score < game.config.ai.mulliganThreshold) {
                toMulligan += (this.plr.hand.indexOf(c) + 1).toString();
            }

            scores += `${c.name}:${score}, `;
        }

        scores = scores.slice(0, -2) + ')';

        this.history.push({ type: `mulligan (T${game.config.ai.mulliganThreshold})`, data: [toMulligan, scores] });

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
    analyzePositive(text: string, context = true): number {
        if (context) {
            context = game.config.ai.contextAnalysis;
        }

        let score = 0;

        const handleEntriesForV = (v: [string, Record<string, number>], sentance: string, word: string, returnValue: boolean) => {
            for (const k of Object.entries(v[1])) {
                if (returnValue) {
                    continue;
                }

                // Remove the last "s" or "d" in order to account for plurals
                const k0 = k[0].replace(/^(.*)[sd]$/, '$1');
                if (!new RegExp(k[0]).test(word) && !new RegExp(k0).test(word)) {
                    continue;
                }

                // If the sentiment is "positive", add to the score. If it is "negative", subtract from the score.
                const opponentTest = /enemy|enemies|opponent/;
                let pos = k[1];
                if (context && opponentTest.test(sentance)) {
                    pos = -pos;
                }

                score -= (v[0] === 'positive') ? -pos : pos;
                returnValue = true;
            }

            return returnValue;
        };

        for (let sentance of text.toLowerCase().split(/[^a-z\d ]/)) {
            sentance = sentance.trim();

            for (let word of sentance.split(' ')) {
                // Filter out any characters not in the alphabet
                word = word.replaceAll(/[^a-z]/g, '');
                let returnValue = false;

                for (const v of Object.entries(game.config.ai.sentiments)) {
                    if (returnValue) {
                        continue;
                    }

                    returnValue = handleEntriesForV(v, sentance, word, returnValue);
                }
            }
        }

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
        let score = this.analyzePositive(c.text || '');

        // Stats
        score += (c.stats ? c.getAttack() + c.getHealth() : game.config.ai.spellValue) * game.config.ai.statsBias;

        // Cost
        score -= c.cost * game.config.ai.costBias;

        // Keywords
        // eslint-disable-next-line no-unused-vars
        for (const _ of Object.keys(c.keywords)) {
            score += game.config.ai.keywordValue;
        }

        // Abilities
        for (const v of Object.values(c)) {
            if (Array.isArray(v) && v[0] instanceof Function) {
                score += game.config.ai.abilityValue;
            }
        }

        return score;
    }

    /**
     * Checks if there are any minions that can attack on the ai's board
     *
     * @returns Can attack
     */
    private _canAttack(): boolean {
        if (this.prevent.includes('attack')) {
            return false;
        }

        const validAttackers = game.board[this.plr.id].filter(m => this._canMinionAttack(m));

        return validAttackers.length > 0;
    }

    /**
     * Returns if the ai can use their hero power
     *
     * @returns Can use hero power
     */
    private _canHeroPower(): boolean {
        if (this.prevent.includes('hero power')) {
            return false;
        }

        const enoughMana = this.plr.mana >= this.plr.heroPowerCost;
        const canUse = this.plr.canUseHeroPower;

        const canHeroPower = enoughMana && canUse;

        // The ai has already used their hero power that turn.
        this.prevent.push('hero power');

        return canHeroPower;
    }

    /**
     * Returns if there are any location cards the ai can use.
     */
    private _canUseLocation(): boolean {
        if (this.prevent.includes('use')) {
            return false;
        }

        const validLocations = game.board[this.plr.id].filter(m => m.type === 'Location' && m.cooldown === 0 && !this.usedLocationsThisTurn.includes(m));

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
        const booleans = !m.sleepy && !m.hasKeyword('Frozen') && !m.hasKeyword('Dormant');
        const numbers = m.getAttack() && m.attackTimes;

        return booleans && Boolean(numbers);
    }

    /**
     * Returns if the minion specified is targettable
     *
     * @param m Minion to check
     *
     * @returns If it is targettable
     */
    private _canTargetMinion(m: Card): boolean {
        const booleans = !m.hasKeyword('Dormant') && !m.hasKeyword('Immune') && !m.hasKeyword('Stealth');

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

        for (const a of currboard) {
            let trades = [...perfectTrades, ...imperfectTrades];

            const score = this.analyzePositiveCard(a);

            // Don't attack with high-value minions.
            if (score > game.config.ai.protectThreshold || trades.map(c => c[0]).includes(a)) {
                continue;
            }

            // If the card has the `sleepy` prop, it has the attackTimes prop too.
            if (a.sleepy ?? a.attackTimes! <= 0) {
                continue;
            }

            const opboard = game.board[this.plr.getOpponent().id].filter(m => this._canTargetMinion(m));

            for (const t of opboard) {
                trades = [...perfectTrades, ...imperfectTrades];
                if (trades.map(c => c[1]).includes(t)) {
                    continue;
                }

                const score = this.analyzePositiveCard(t);

                // Don't waste resources attacking useless targets.
                if (score < game.config.ai.ignoreThreshold) {
                    continue;
                }

                if (a.getAttack() === t.getHealth()) {
                    perfectTrades.push([a, t]);
                } else if (a.getAttack() > t.getHealth()) {
                    imperfectTrades.push([a, t]);
                }
            }
        }

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

        for (const m of board[player.id]) {
            score += m.score;
        }

        for (const f of Object.entries(player)) {
            if (typeof f[1] !== 'number') {
                continue;
            }

            const [key, value] = f as [string, number];

            const i = ['health', 'maxHealth', 'armor', 'emptyMana'];
            if (!i.includes(key)) {
                continue;
            }

            score += value;
        }

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
        const s = (winner === this.plr) ? score : opScore;

        return [winner, s];
    }

    /**
     * Returns the taunts on the board
     */
    private _findTaunts(): Card[] {
        return game.board[this.plr.getOpponent().id].filter(m => m.hasKeyword('Taunt'));
    }

    /**
     * Does a trade
     *
     * @returns Attacker, Target
     */
    private _attackTrade(): Card[] | undefined {
        const [perfectTrades, imperfectTrades] = this._attackFindTrades();

        let returnValue;
        if (perfectTrades.length > 0) {
            returnValue = perfectTrades[0];
        } else if (imperfectTrades.length > 0) {
            returnValue = imperfectTrades[0];
        }

        if (returnValue) {
            this.history.push({ type: 'trade', data: [returnValue[0].name, returnValue[1].name] });
        }

        return returnValue;
    }

    /**
     * Does a general attack
     *
     * @param board
     *
     * @returns Attacker, Target
     */
    private _attackGeneral(board: ScoredCard[][]): Array<Target | -1> {
        const currentWinner = this._findWinner(board);

        let returnValue = null;

        // Risky
        const opScore = this._scorePlayer(this.plr.getOpponent(), board);

        // If the ai is winner by more than 'threshold' points, enable risk mode
        const riskMode = currentWinner[1] >= opScore + game.config.ai.riskThreshold;

        // If there are taunts, override risk mode
        const taunts = this._findTaunts();

        returnValue = riskMode && taunts.length <= 0 ? this._attackGeneralRisky() : this._attackGeneralMinion();

        if (returnValue.includes(-1)) {
            return [-1, -1];
        }

        const returned: Target[] = returnValue as Target[];

        this.history.push({ type: 'attack', data: [returned[0].name, returned[1].name] });

        // If the ai is not focusing on a minion, focus on the returned minion
        if (!this.focus && returned[1] instanceof Card) {
            this.focus = returned[1];
        }

        return returned;
    }

    /**
     * Does a risky attack.
     *
     * @returns Attacker, Target
     */
    private _attackGeneralRisky(): Array<Target | -1> {
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
    private _attackGeneralMinion(): Array<Target | -1> {
        // If the focused minion doesn't exist, select a new minion to focus
        if (this.focus && !game.board[this.plr.getOpponent().id].includes(this.focus)) {
            this.focus = undefined;
        }

        const target = !this.focus || (this._findTaunts().length > 0 && !this.focus.hasKeyword('Taunt')) ? this._attackGeneralChooseTarget() : this.focus;

        return [this._attackGeneralChooseAttacker(target instanceof Player), target];
    }

    /**
     * Choose a target for a general attack
     *
     * @returns Target | -1 (Go back)
     */
    private _attackGeneralChooseTarget(): Target | -1 {
        let highestScore: Array<Target | number | undefined> = [undefined, -9999];

        let board = game.board[this.plr.getOpponent().id];

        // If there is a taunt, select that as the target
        const taunts = this._findTaunts();
        if (Array.isArray(taunts) && taunts.length > 0) {
            return taunts[0];
        }

        board = board.filter(m => this._canTargetMinion(m));

        for (const m of board) {
            if (typeof highestScore[1] !== 'number') {
                highestScore[1] = -9999;
            }

            const score = this.analyzePositiveCard(m);
            if (score < highestScore[1]) {
                continue;
            }

            highestScore = [m, score];
        }

        const target = highestScore[0];

        // TODO: Does this never fail? What is going on here!?
        if (!target) {
            return this.plr.getOpponent();
        }

        if (!target) {
            this.prevent.push('attack');
            return -1;
        }

        // Only -1 is a valid number
        if (typeof target === 'number' && target !== -1) {
            return -1;
        }

        return target;
    }

    /**
     * Choose an attacker for a general attack
     *
     * @param targetIsPlayer If the target is a player
     *
     * @returns Attacker | -1 (Go back)
     */
    private _attackGeneralChooseAttacker(targetIsPlayer = false): Target | -1 {
        let lowestScore: Array<Target | number | undefined> = [undefined, 9999];

        let board = game.board[this.plr.id];
        board = board.filter(c => this._canMinionAttack(c));

        for (const m of board) {
            if (typeof lowestScore[1] !== 'number') {
                lowestScore[1] = 9999;
            }

            const score = this.analyzePositiveCard(m);

            if (score > lowestScore[1] || (score > game.config.ai.protectThreshold && !targetIsPlayer)) {
                continue;
            }

            if (m.sleepy ?? m.attackTimes! <= 0) {
                continue;
            }

            if (targetIsPlayer && !m.canAttackHero) {
                continue;
            }

            lowestScore = [m, score];
        }

        const attacker = lowestScore[0];

        // TODO: Does this never fail?
        if (!attacker && (this.plr.attack > 0 && this.plr.canAttack)) {
            return this.plr;
        }

        if (!attacker) {
            this.prevent.push('attack');
            return -1;
        }

        // Only -1 is a valid number
        if (typeof attacker === 'number' && attacker !== -1) {
            return -1;
        }

        return attacker;
    }
}
