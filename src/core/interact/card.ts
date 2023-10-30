import { Card, type Player } from '../../internal.js';

export const CARD_INTERACT = {
    /**
     * Asks the user to select a location card to use, and activate it.
     *
     * @returns Success
     */
    useLocation(): boolean | 'nolocations' | 'invalidtype' | 'cooldown' | 'refund' {
        const LOCATIONS = game.board[game.player.id].filter(m => m.type === 'Location');
        if (LOCATIONS.length <= 0) {
            return 'nolocations';
        }

        const LOCATION = game.interact.selectCardTarget('Which location do you want to use?', undefined, 'friendly', ['allowLocations']);
        if (!LOCATION) {
            return 'refund';
        }

        if (LOCATION.type !== 'Location') {
            return 'invalidtype';
        }

        if (LOCATION.cooldown && LOCATION.cooldown > 0) {
            return 'cooldown';
        }

        if (LOCATION.activate('use') === game.constants.REFUND) {
            return 'refund';
        }

        if (LOCATION.durability === undefined) {
            throw new Error('Location card\'s durability is undefined');
        }

        LOCATION.durability -= 1;
        LOCATION.cooldown = LOCATION.backups.init.cooldown;
        return true;
    },

    /**
     * Asks the player to mulligan their cards
     *
     * @param plr The player to ask
     *
     * @returns A string of the indexes of the cards the player mulligan'd
     */
    mulligan(plr: Player): string {
        game.interact.info.showGame(plr);

        let sb = '\nChoose the cards to mulligan (1, 2, 3, ...):\n';
        if (!game.config.general.debug) {
            sb += '<gray>(Example: 13 will mulligan the cards with the ids 1 and 3, 123 will mulligan the cards with the ids 1, 2 and 3, just pressing enter will not mulligan any cards):</gray>\n';
        }

        const INPUT = plr.ai ? plr.ai.mulligan() : game.input(sb);
        const SUCCESS = plr.mulligan(INPUT);

        if (!SUCCESS && INPUT !== '') {
            game.pause('<red>Invalid input!</red>\n');
            return this.mulligan(plr);
        }

        return INPUT;
    },

    /**
     * Asks the current player a `prompt` and shows 3 cards from their deck for the player to choose, the chosen card will be added to the top of their deck
     *
     * @param prompt The prompt to ask the user
     *
     * @returns The card chosen
     */
    dredge(prompt = 'Choose a card to Dredge:'): Card | undefined {
        // Look at the bottom three cards of the deck and put one on the top.
        const CARDS = game.player.deck.slice(0, 3);

        // Check if ai
        if (game.player.ai) {
            const CARD = game.player.ai.dredge(CARDS);
            if (!CARD) {
                return undefined;
            }

            // Removes the selected card from the players deck.
            game.functions.util.remove(game.player.deck, CARD);
            game.player.deck.push(CARD);

            return CARD;
        }

        game.interact.info.showGame(game.player);

        game.log(`\n${prompt}`);

        if (CARDS.length <= 0) {
            return undefined;
        }

        for (const [INDEX, CARD] of CARDS.entries()) {
            game.log(game.interact.card.getReadable(CARD, INDEX + 1));
        }

        const CHOICE = game.input('> ');

        const CARD_ID = game.lodash.parseInt(CHOICE) - 1;
        const CARD = CARDS[CARD_ID];

        if (!CARD) {
            return this.dredge(prompt);
        }

        // Removes the selected card from the players deck.
        game.functions.util.remove(game.player.deck, CARD);
        game.player.deck.push(CARD);

        return CARD;
    },

    /**
     * Asks the user a "prompt", show them "amount" cards. The cards are chosen from "cards".
     *
     * @param prompt The prompt to ask
     * @param cards The cards to choose from
     * @param filterClassCards If it should filter away cards that do not belong to the player's class. Keep this at default if you are using `functions.card.getAll()`, disable this if you are using either player's deck / hand / graveyard / etc...
     * @param amount The amount of cards to show
     * @param _cards Do not use this variable, keep it at default
     *
     * @returns The card chosen.
     */
    discover(prompt: string, cards: Card[] = [], filterClassCards = true, amount = 3, _cards: Card[] = []): Card | undefined {
        game.interact.info.showGame(game.player);
        let values: Card[] = _cards;

        if (cards.length <= 0) {
            cards = game.functions.card.getAll();
        }

        if (cards.length <= 0 || !cards) {
            return undefined;
        }

        if (filterClassCards) {
            // We need to filter the cards
            // of the filter function
            cards = cards.filter(card => game.functions.card.validateClasses(card.classes, game.player.heroClass));
        }

        // No cards from previous discover loop, we need to generate new ones.
        if (_cards.length === 0) {
            values = game.lodash.sampleSize(cards, amount);
            values = values.map(c => {
                if (c instanceof Card) {
                    c.perfectCopy();
                }

                return c;
            });
        }

        if (values.length <= 0) {
            return undefined;
        }

        if (game.player.ai) {
            return game.player.ai.discover(values);
        }

        game.log(`\n${prompt}:`);

        for (const [INDEX, CARD] of values.entries()) {
            game.log(game.interact.card.getReadable(CARD, INDEX + 1));
        }

        const CHOICE = game.input();

        if (!values[game.lodash.parseInt(CHOICE) - 1]) {
            // Invalid input
            // We still want the user to be able to select a card, so we force it to be valid
            return this.discover(prompt, cards, filterClassCards, amount, values);
        }

        const CARD = values[game.lodash.parseInt(CHOICE) - 1];

        return CARD;
    },

    /**
     * Replaces placeholders in the description of a card object.
     *
     * @param card The card.
     * @param overrideText The description. If empty, it uses the card's description instead.
     * @param _depth The depth of recursion.
     *
     * @returns The modified description with placeholders replaced.
     */
    doPlaceholders(card: Card, overrideText = '', _depth = 0): string {
        let reg = /{ph:(.*?)}/;

        let text = overrideText;
        if (!overrideText) {
            text = card.text || '';
        }

        let running = true;
        while (running) {
            const REGED_DESC = reg.exec(text);

            // There is nothing more to extract
            if (!REGED_DESC) {
                running = false;
                break;
            }

            // Get the capturing group result
            const KEY = REGED_DESC[1];

            card.replacePlaceholders();
            const REPLACEMENT = card.placeholder;
            if (!REPLACEMENT) {
                throw new Error('Card placeholder not found.');
            }

            let replacement = REPLACEMENT[KEY] as string | Card;

            if (replacement instanceof Card) {
                // The replacement is a card
                const ONLY_SHOW_NAME = (
                    game.config.advanced.getReadableCardNoRecursion
                    || !game.player.detailedView
                );

                const ALWAYS_SHOW_FULL_CARD = game.config.advanced.getReadableCardAlwaysShowFullCard;

                replacement = ONLY_SHOW_NAME && !ALWAYS_SHOW_FULL_CARD ? replacement.colorFromRarity() : game.interact.card.getReadable(replacement, -1, _depth + 1);
            }

            text = game.functions.color.fromTags(text.replace(reg, replacement));
        }

        // Replace spell damage placeholders
        reg = /\$(\d+?)/;

        running = true;
        while (running) {
            const REGED_DESC = reg.exec(text);
            if (!REGED_DESC) {
                running = false;
                break;
            }

            // Get the capturing group result
            const KEY = REGED_DESC[1];
            const REPLACEMENT = game.lodash.parseInt(KEY) + game.player.spellDamage;

            text = text.replace(reg, REPLACEMENT.toString());
        }

        return text;
    },

    /**
     * Returns a card in a user readable state. If you game.log the result of this, the user will get all the information they need from the card.
     *
     * @param i If this is set, this function will add `[i]` to the beginning of the card. This is useful if there are many different cards to choose from.
     * @param _depth The depth of recursion. DO NOT SET THIS MANUALLY.
     *
     * @returns The readable card
     */
    getReadable(card: Card, i = -1, _depth = 0): string {
        /**
         * If it should show detailed errors regarding depth.
         */
        const SHOW_DETAILED_ERROR: boolean = (game.config.general.debug || game.config.info.branch !== 'stable' || game.player.detailedView);

        if (_depth > 0 && game.config.advanced.getReadableCardNoRecursion) {
            if (SHOW_DETAILED_ERROR) {
                return 'RECURSION ATTEMPT BLOCKED';
            }

            return '...';
        }

        if (_depth > game.config.advanced.getReadableCardMaxDepth) {
            if (SHOW_DETAILED_ERROR) {
                return 'MAX DEPTH REACHED';
            }

            return '...';
        }

        let sb = '';

        let text = (card.text || '').length > 0 ? ` (${card.text}) ` : ' ';

        // Extract placeholder value, remove the placeholder header and footer
        if (card.placeholder ?? /\$(\d+?)/.test(card.text || '')) {
            text = this.doPlaceholders(card, text, _depth);
        }

        let cost = `{${card.cost}} `;

        switch (card.costType) {
            case 'mana': {
                cost = `<cyan>${cost}</cyan>`;
                break;
            }

            case 'armor': {
                cost = `<gray>${cost}</gray>`;
                break;
            }

            case 'health': {
                cost = `<red>${cost}</red>`;
                break;
            }

            default: {
                break;
            }
        }

        const { displayName: DISPLAY_NAME } = card;

        if (i !== -1) {
            sb += `[${i}] `;
        }

        sb += cost;
        sb += card.colorFromRarity(DISPLAY_NAME);

        if (card.stats) {
            sb += game.functions.color.if(card.canAttack(), 'bright:green', ` [${card.stats?.join(' / ')}]`);
        } else if (card.type === 'Location') {
            const { durability: DURABILITY } = card;
            const MAX_DURABILITY = card.backups.init.durability;
            const MAX_COOLDOWN = card.backups.init.cooldown ?? 0;

            sb += ` {<bright:green>Durability: ${DURABILITY} / ${MAX_DURABILITY}</bright:green>,`;
            sb += ` <cyan>Cooldown: ${card.cooldown} / ${MAX_COOLDOWN}</cyan>}`;
        }

        sb += text;
        sb += `<yellow>(${card.type})</yellow>`;

        // Add the keywords
        sb += Object.keys(card.keywords).map(keyword => ` <gray>{${keyword}}</gray>`).join('');

        return sb;
    },

    /**
     * Shows information from the card, game.log's it and waits for the user to press enter.
     *
     * @param help If it should show a help message which displays what the different fields mean.
     */
    view(card: Card, help = true) {
        const CARD = this.getReadable(card);
        const CLASS = `<gray>${card.classes.join(' / ')}</gray>`;

        let tribe = '';
        let spellSchool = '';
        let locCooldown = '';

        const { type: TYPE } = card;

        switch (TYPE) {
            case 'Minion': {
                tribe = ` (<gray>${card.tribe ?? 'None'}</gray>)`;
                break;
            }

            case 'Spell': {
                spellSchool = card.spellSchool ? ` (<cyan>${card.spellSchool}</cyan>)` : ' (None)';
                break;
            }

            case 'Location': {
                locCooldown = ` (<cyan>${card.storage.init.cooldown ?? 0}</cyan>)`;
                break;
            }

            case 'Hero':
            case 'Weapon':
            case 'Undefined': {
                break;
            }

            default: {
                throw new Error('Type of card cannot be viewed as it is not handled by `interact.card.view`');
            }
        }
        // No default

        if (help) {
            game.log('<cyan>{cost}</cyan> <b>Name</b> (<bright:green>[attack / health]</bright:green> if is has) (description) <yellow>(type)</yellow> ((tribe) or (spell class) or (cooldown)) <gray>[class]</gray>');
        }

        game.log(CARD + (tribe || spellSchool || locCooldown) + ` [${CLASS}]`);

        game.log();
        game.pause();
    },

    /**
     * Spawns a DIY card for the given player.
     */
    spawnInDiyCard(player: Player) {
        // Don't allow ai's to get diy cards
        if (player.ai) {
            return;
        }

        const LIST = game.functions.card.getAll(false).filter(card => /DIY \d+/.test(card.name));
        const CARD = game.lodash.sample(LIST);
        if (!CARD) {
            return;
        }

        CARD.plr = player;
        player.addToHand(CARD);
    },
};
