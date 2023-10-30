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
        for (const CARD of this.plr.hand) {
            const SCORE = this.analyzePositiveCard(CARD);

            if (SCORE <= bestScore || CARD.cost > this.plr.mana || this.cardsPlayedThisTurn.includes(CARD)) {
                continue;
            }

            // If the card is a minion and the player doesn't have the board space to play it, ignore the card
            if (CARD.canBeOnBoard() && game.board[this.plr.id].length >= game.config.general.maxBoardSpace) {
                continue;
            }

            // Prevent the ai from playing the same card they returned from when selecting a target
            let prevent = false;

            for (const [INDEX, HISTORY_ENTRY] of this.history.entries()) {
                if (Array.isArray(HISTORY_ENTRY.data) && HISTORY_ENTRY.data[1] === '0,1' && this.history[INDEX - 1].data[0] === CARD.name) {
                    prevent = true;
                }
            }

            if (prevent) {
                continue;
            }

            bestMove = CARD;
            bestScore = SCORE;
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
            for (const [INDEX, HISTORY_ENTRY] of this.history.entries()) {
                if (Array.isArray(HISTORY_ENTRY) && HISTORY_ENTRY[0] === 'selectTarget' && HISTORY_ENTRY[1] === '0,1') {
                    this.history[INDEX].data = null;
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
        const BOARD: ScoredCard[][] = game.board.map(m => m.map(c => ({ card: c, score: this.analyzePositiveCard(c) })));

        const AMOUNT_OF_TRADES = this._attackFindTrades().map(t => t.length).reduce((a, b) => a + b);

        // The ai should skip the trade stage if in risk mode
        const CURRENT_WINNER = this._findWinner(BOARD);
        const OPPONENT_SCORE = this._scorePlayer(this.plr.getOpponent(), BOARD);

        // If the ai is winner by more than 'threshold' points, enable risk mode
        const RISK_MODE = CURRENT_WINNER[1] >= OPPONENT_SCORE + game.config.ai.riskThreshold;

        const TAUNTS = this._findTaunts();

        // If there is a taunt, attack it before trading
        if (TAUNTS.length > 0) {
            return this._attackGeneral(BOARD);
        }

        if (AMOUNT_OF_TRADES > 0 && !RISK_MODE) {
            return this._attackTrade() ?? [-1, -1];
        }

        return this._attackGeneral(BOARD);
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

        for (const MINION of game.board[this.plr.id].filter(m => m.canAttack())) {
            const SCORE = this.analyzePositiveCard(MINION);

            if (SCORE >= worstScore) {
                continue;
            }

            worstMinion = MINION;
            worstScore = SCORE;
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
        const TAUNTS = this._findTaunts();
        const TARGETS = TAUNTS.length > 0 ? TAUNTS : game.board[this.plr.getOpponent().id];

        for (const TARGET of TARGETS.filter(target => this._canTargetMinion(target))) {
            const SCORE = this.analyzePositiveCard(TARGET);

            if (SCORE <= bestScore) {
                continue;
            }

            bestMinion = TARGET;
            bestScore = SCORE;
        }

        let target: Target | undefined = bestMinion;

        // If the AI has no minions to attack, attack the enemy hero
        if (!target) {
            if (TAUNTS.length === 0 && attacker && ((attacker as Target) instanceof Player || (attacker).canAttackHero)) {
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

        const ARRAY = [];
        let strbuilder = '';

        if (attacker instanceof Player) {
            ARRAY.push('P' + (attacker.id + 1));
        } else if (attacker instanceof Card) {
            ARRAY.push(attacker.name);
            strbuilder += worstScore + ', ';
        }

        if (target instanceof Player) {
            ARRAY.push('P' + (target.id + 1));
        } else if ((target as Target) instanceof Card) {
            ARRAY.push((target).name);
            strbuilder += bestScore;
        }

        this.history.push({ type: `attack, [${strbuilder}]`, data: ARRAY });

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
            const LOCATIONS = game.board[this.plr.id].filter(m => m.type === 'Location' && m.cooldown === 0 && !this.usedLocationsThisTurn.includes(m));
            this.usedLocationsThisTurn.push(LOCATIONS[0]);

            if (LOCATIONS.length > 0) {
                return LOCATIONS[0];
            }
        }

        const OPPONENT = this.plr.getOpponent();

        let side = null;

        const SCORE = this.analyzePositive(prompt, false);

        if (SCORE > 0) {
            side = 'self';
        } else if (SCORE < 0) {
            side = 'enemy';
        }

        if (forceSide !== 'any') {
            side = forceSide;
        }

        const SIDE_ID = (side === 'self') ? this.plr.id : OPPONENT.id;

        if (game.board[SIDE_ID].length <= 0 && forceClass === 'minion') {
            this.history.push({ type: 'selectTarget', data: '0,1' });

            return false;
        }

        if (forceClass === 'hero') {
            let returnValue: Player | false = false;

            if (side === 'self') {
                returnValue = this.plr;
            } else if (side === 'enemy') {
                returnValue = OPPONENT;
            }

            const HISTORY_DATA = (returnValue instanceof Player) ? 'P' + (returnValue.id + 1) : returnValue;

            this.history.push({ type: 'selectTarget', data: HISTORY_DATA });

            return returnValue;
        }

        // The player has no minions, select their face
        if (game.board[SIDE_ID].length <= 0) {
            const RETURN_VALUE: Player | false = false;

            if (forceClass === 'minion') {
                this.history.push({ type: 'selectTarget', data: -1 });
            } else {
                let returnValue;
                if (SIDE_ID === 0) {
                    returnValue = game.player1;
                } else if (SIDE_ID === 1) {
                    returnValue = game.player2;
                }

                if (!returnValue) {
                    throw new Error('Player ' + (SIDE_ID + 1) + ' not found');
                }

                this.history.push({ type: 'selectTarget', data: 'P' + (returnValue.id + 1) });
            }

            return RETURN_VALUE;
        }

        let bestMinion: Card | undefined;
        let bestScore = -100_000;

        for (const TARGET of game.board[SIDE_ID]) {
            if (!this._canTargetMinion(TARGET)) {
                continue;
            }

            if ((card && card.type === 'Spell' && TARGET.hasKeyword('Elusive')) ?? TARGET.type === 'Location') {
                continue;
            }

            const SCORE = this.analyzePositiveCard(TARGET);

            if (SCORE <= bestScore) {
                continue;
            }

            bestMinion = TARGET;
            bestScore = SCORE;
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
        for (const CARD of cards) {
            // Card-like is invalid
            if (!CARD.name) {
                continue;
            }

            const SCORE = this.analyzePositiveCard(new Card(CARD.name, this.plr));

            if (SCORE <= bestScore) {
                continue;
            }

            bestCard = CARD;
            bestScore = SCORE;
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
        for (const CARD of cards) {
            const SCORE = this.analyzePositiveCard(CARD);

            if (SCORE <= bestScore) {
                continue;
            }

            bestCard = CARD;
            bestScore = SCORE;
        }

        if (!bestCard) {
            return undefined;
        }

        const NAME = bestCard ? bestCard.name : null;

        this.history.push({ type: 'dredge', data: [NAME, bestScore] });
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
        for (const [INDEX, CARD] of options.entries()) {
            const SCORE = this.analyzePositive(CARD);

            if (SCORE <= bestScore) {
                continue;
            }

            bestChoice = INDEX;
            bestScore = SCORE;
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

        for (const [INDEX, CARD] of options.entries()) {
            const SCORE = this.analyzePositive(CARD);

            if (SCORE <= bestScore) {
                continue;
            }

            bestChoice = INDEX;
            bestScore = SCORE;
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
        const SCORE = this.analyzePositive(prompt);
        const RETURN_VALUE = SCORE > 0;

        this.history.push({ type: 'yesNoQuestion', data: [prompt, RETURN_VALUE] });

        return RETURN_VALUE;
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

        const SCORE = this.analyzePositiveCard(card);
        const RETURN_VALUE = SCORE <= game.config.ai.tradeThreshold;

        this.history.push({ type: 'trade', data: [card.name, RETURN_VALUE, SCORE] });

        return RETURN_VALUE;
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
        const RETURN_VALUE = !(this.plr.mana < 2);

        this.history.push({ type: 'forge', data: [card.name, RETURN_VALUE] });
        return RETURN_VALUE;
    }

    /**
     * Returns the list of cards the ai wants to mulligan.
     *
     * @returns The indexes of the cards to mulligan. Look in `Interact.mulligan` for more details.
     */
    mulligan(): string {
        let toMulligan = '';
        let scores = '(';

        for (const CARD of this.plr.hand) {
            if (CARD.name === 'The Coin') {
                continue;
            }

            const SCORE = this.analyzePositiveCard(CARD);

            if (SCORE < game.config.ai.mulliganThreshold) {
                toMulligan += (this.plr.hand.indexOf(CARD) + 1).toString();
            }

            scores += `${CARD.name}:${SCORE}, `;
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

        const handleEntriesForV = (sentimentObject: [string, Record<string, number>], sentance: string, word: string, returnValue: boolean) => {
            for (const ENTRY of Object.entries(sentimentObject[1])) {
                if (returnValue) {
                    continue;
                }

                // Remove the last "s" or "d" in order to account for plurals
                const SENTIMENT_WITHOUT_PLURAL = ENTRY[0].replace(/^(.*)[sd]$/, '$1');
                if (!new RegExp(ENTRY[0]).test(word) && !new RegExp(SENTIMENT_WITHOUT_PLURAL).test(word)) {
                    continue;
                }

                // If the sentiment is "positive", add to the score. If it is "negative", subtract from the score.
                let pos = ENTRY[1];
                if (context && /enemy|enemies|opponent/.test(sentance)) {
                    pos = -pos;
                }

                score -= (sentimentObject[0] === 'positive') ? -pos : pos;
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

                for (const SENTIMENT_OBJECT of Object.entries(game.config.ai.sentiments)) {
                    if (returnValue) {
                        continue;
                    }

                    returnValue = handleEntriesForV(SENTIMENT_OBJECT, sentance, word, returnValue);
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
        // eslint-disable-next-line @typescript-eslint/naming-convention, no-unused-vars
        for (const _ of Object.keys(c.keywords)) {
            score += game.config.ai.keywordValue;
        }

        // Abilities
        for (const VALUE of Object.values(c)) {
            if (Array.isArray(VALUE) && VALUE[0] instanceof Function) {
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

        const VALID_ATTACKERS = game.board[this.plr.id].filter(m => m.canAttack());

        return VALID_ATTACKERS.length > 0;
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

        const ENOUGH_MANA = this.plr.mana >= this.plr.hero.hpCost!;
        const CAN_USE = this.plr.canUseHeroPower;

        const CAN_HERO_POWER = ENOUGH_MANA && CAN_USE;

        // The ai has already used their hero power that turn.
        this.prevent.push('hero power');

        return CAN_HERO_POWER;
    }

    /**
     * Returns if there are any location cards the ai can use.
     */
    private _canUseLocation(): boolean {
        if (this.prevent.includes('use')) {
            return false;
        }

        const VALID_LOCATIONS = game.board[this.plr.id].filter(m => m.type === 'Location' && m.cooldown === 0 && !this.usedLocationsThisTurn.includes(m));

        return VALID_LOCATIONS.length > 0;
    }

    /**
     * Returns if the minion specified is targettable
     *
     * @param m Minion to check
     *
     * @returns If it is targettable
     */
    private _canTargetMinion(m: Card): boolean {
        return !m.hasKeyword('Dormant') && !m.hasKeyword('Immune') && !m.hasKeyword('Stealth');
    }

    // ATTACKING
    /**
     * Finds all possible trades for the ai and returns them
     *
     * @returns `Perfect Trades`: [[attacker, target], ...], `Imperfect Trades`: [[attacker, target], ...]
     */
    private _attackFindTrades(): [Card[][], Card[][]] {
        const PERFECT_TRADES: Card[][] = [];
        const IMPERFECT_TRADES: Card[][] = [];

        const CURRENT_BOARD = game.board[this.plr.id].filter(m => m.canAttack());

        for (const CARD of CURRENT_BOARD) {
            let trades = [...PERFECT_TRADES, ...IMPERFECT_TRADES];

            const SCORE = this.analyzePositiveCard(CARD);

            // Don't attack with high-value minions.
            if (SCORE > game.config.ai.protectThreshold || trades.map(c => c[0]).includes(CARD)) {
                continue;
            }

            // If the card has the `sleepy` prop, it has the attackTimes prop too.
            if (CARD.sleepy ?? CARD.attackTimes! <= 0) {
                continue;
            }

            const OPPONENT_BOARD = game.board[this.plr.getOpponent().id].filter(m => this._canTargetMinion(m));

            for (const TARGET of OPPONENT_BOARD) {
                trades = [...PERFECT_TRADES, ...IMPERFECT_TRADES];
                if (trades.map(c => c[1]).includes(TARGET)) {
                    continue;
                }

                const SCORE = this.analyzePositiveCard(TARGET);

                // Don't waste resources attacking useless targets.
                if (SCORE < game.config.ai.ignoreThreshold) {
                    continue;
                }

                if (CARD.getAttack() === TARGET.getHealth()) {
                    PERFECT_TRADES.push([CARD, TARGET]);
                } else if (CARD.getAttack() > TARGET.getHealth()) {
                    IMPERFECT_TRADES.push([CARD, TARGET]);
                }
            }
        }

        return [PERFECT_TRADES, IMPERFECT_TRADES];
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

        for (const SCORED_CARD of board[player.id]) {
            score += SCORED_CARD.score;
        }

        for (const ENTRY of Object.entries(player)) {
            const [KEY, VALUE] = ENTRY as [string, number];

            if (typeof VALUE !== 'number') {
                continue;
            }

            const VALID_KEYS = ['health', 'maxHealth', 'armor', 'emptyMana'];
            if (!VALID_KEYS.includes(KEY)) {
                continue;
            }

            score += VALUE;
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
        const SCORE = this._scorePlayer(this.plr, board);
        const OPPONENT_SCORE = this._scorePlayer(this.plr.getOpponent(), board);

        const WINNER = (SCORE > OPPONENT_SCORE) ? this.plr : this.plr.getOpponent();
        const WINNER_SCORE = (WINNER === this.plr) ? SCORE : OPPONENT_SCORE;

        return [WINNER, WINNER_SCORE];
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
    private _attackTrade(): Card[] {
        const [PERFECT_TRADES, IMPERFECT_TRADES] = this._attackFindTrades();
        const RETURN_VALUE = PERFECT_TRADES.length > 0 ? PERFECT_TRADES[0] : IMPERFECT_TRADES[0];

        if (RETURN_VALUE) {
            this.history.push({ type: 'trade', data: [RETURN_VALUE[0].name, RETURN_VALUE[1].name] });
        }

        return RETURN_VALUE;
    }

    /**
     * Does a general attack
     *
     * @param board
     *
     * @returns Attacker, Target
     */
    private _attackGeneral(board: ScoredCard[][]): Array<Target | -1> {
        const WINNER = this._findWinner(board);

        // Risky
        const OPPONENT_SCORE = this._scorePlayer(this.plr.getOpponent(), board);

        // If the ai is winner by more than 'threshold' points, enable risk mode
        const RISK_MODE = WINNER[1] >= OPPONENT_SCORE + game.config.ai.riskThreshold;

        // If there are taunts, override risk mode
        const TAUNTS = this._findTaunts();

        const RETURN_VALUE = RISK_MODE && TAUNTS.length <= 0 ? this._attackGeneralRisky() : this._attackGeneralMinion();

        if (RETURN_VALUE.includes(-1)) {
            return [-1, -1];
        }

        const RETURNED = RETURN_VALUE as Target[];

        this.history.push({ type: 'attack', data: [RETURNED[0].name, RETURNED[1].name] });

        // If the ai is not focusing on a minion, focus on the returned minion
        if (!this.focus && RETURNED[1] instanceof Card) {
            this.focus = RETURNED[1];
        }

        return RETURNED;
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

        const TARGET = !this.focus || (this._findTaunts().length > 0 && !this.focus.hasKeyword('Taunt')) ? this._attackGeneralChooseTarget() : this.focus;

        return [this._attackGeneralChooseAttacker(TARGET instanceof Player), TARGET];
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
        const TAUNTS = this._findTaunts();
        if (Array.isArray(TAUNTS) && TAUNTS.length > 0) {
            return TAUNTS[0];
        }

        board = board.filter(m => this._canTargetMinion(m));

        for (const CARD of board) {
            if (typeof highestScore[1] !== 'number') {
                highestScore[1] = -9999;
            }

            const SCORE = this.analyzePositiveCard(CARD);
            if (SCORE < highestScore[1]) {
                continue;
            }

            highestScore = [CARD, SCORE];
        }

        const TARGET = highestScore[0];

        // TODO: Does this never fail? What is going on here!?
        if (!TARGET) {
            return this.plr.getOpponent();
        }

        if (!TARGET) {
            this.prevent.push('attack');
            return -1;
        }

        // Only -1 is a valid number
        if (typeof TARGET === 'number' && TARGET !== -1) {
            return -1;
        }

        return TARGET;
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
        board = board.filter(c => c.canAttack());

        for (const CARD of board) {
            if (typeof lowestScore[1] !== 'number') {
                lowestScore[1] = 9999;
            }

            const SCORE = this.analyzePositiveCard(CARD);

            if (SCORE > lowestScore[1] || (SCORE > game.config.ai.protectThreshold && !targetIsPlayer)) {
                continue;
            }

            if (CARD.sleepy ?? CARD.attackTimes! <= 0) {
                continue;
            }

            if (targetIsPlayer && !CARD.canAttackHero) {
                continue;
            }

            lowestScore = [CARD, SCORE];
        }

        const ATTACKER = lowestScore[0];

        // TODO: Does this never fail?
        if (!ATTACKER && (this.plr.attack > 0 && this.plr.canAttack)) {
            return this.plr;
        }

        if (!ATTACKER) {
            this.prevent.push('attack');
            return -1;
        }

        // Only -1 is a valid number
        if (typeof ATTACKER === 'number' && ATTACKER !== -1) {
            return -1;
        }

        return ATTACKER;
    }
}
