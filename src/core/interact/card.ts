import {type CardKeyword} from '@Game/types.js';
import {Card, type Player} from '../../internal.js';

export const cardInteract = {
    /**
     * Asks the user to select a location card to use, and activate it.
     *
     * @return Success
     */
    useLocation(): boolean | 'nolocations' | 'invalidtype' | 'cooldown' | -1 {
        const locations = game.board[game.player.id].filter(m => m.type === 'Location');
        if (locations.length <= 0) {
            return 'nolocations';
        }

        const location = game.interact.selectCardTarget('Which location do you want to use?', undefined, 'friendly', ['allowLocations']);
        if (!location) {
            return -1;
        }

        if (location.type !== 'Location') {
            return 'invalidtype';
        }

        if (location.cooldown && location.cooldown > 0) {
            return 'cooldown';
        }

        if (location.activate('use') === game.constants.refund) {
            return -1;
        }

        if (location.durability === undefined) {
            throw new Error('Location card\'s durability is undefined');
        }

        location.durability -= 1;
        location.cooldown = location.backups.init.cooldown;
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
        game.interact.info.printAll(plr);

        let sb = '\nChoose the cards to mulligan (1, 2, 3, ...):\n';
        if (!game.config.general.debug) {
            sb += '<gray>(Example: 13 will mulligan the cards with the ids 1 and 3, 123 will mulligan the cards with the ids 1, 2 and 3, just pressing enter will not mulligan any cards):</gray>\n';
        }

        const input = plr.ai ? plr.ai.mulligan() : game.input(sb);
        const isInt = plr.mulligan(input);

        if (!isInt && input !== '') {
            game.pause('<red>Invalid input!</red>\n');
            return this.mulligan(plr);
        }

        return input;
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
        const cards = game.player.deck.slice(0, 3);

        // Check if ai
        if (game.player.ai) {
            const card = game.player.ai.dredge(cards);
            if (!card) {
                return undefined;
            }

            // Removes the selected card from the players deck.
            game.functions.util.remove(game.player.deck, card);
            game.player.deck.push(card);

            return card;
        }

        game.interact.info.printAll(game.player);

        game.log(`\n${prompt}`);

        if (cards.length <= 0) {
            return undefined;
        }

        for (const [i, c] of cards.entries()) {
            game.log(game.interact.card.getReadable(c, i + 1));
        }

        const choice = game.input('> ');

        const cardId = game.lodash.parseInt(choice) - 1;
        const card = cards[cardId];

        if (!card) {
            return this.dredge(prompt);
        }

        // Removes the selected card from the players deck.
        game.functions.util.remove(game.player.deck, card);
        game.player.deck.push(card);

        return card;
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
        game.interact.info.printAll(game.player);
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

        for (const [i, v] of values.entries()) {
            const card = game.functions.card.getFromName(v.name);
            if (!card) {
                continue;
            }

            game.log(game.interact.card.getReadable(v, i + 1));
        }

        const choice = game.input();

        if (!values[game.lodash.parseInt(choice) - 1]) {
            // Invalid input
            // We still want the user to be able to select a card, so we force it to be valid
            return this.discover(prompt, cards, filterClassCards, amount, values);
        }

        const card = values[game.lodash.parseInt(choice) - 1];

        return card;
    },

    /**
     * Replaces placeholders in the description of a card object.
     *
     * @param card The card.
     * @param overrideText The description. If empty, it uses the card's description instead.
     * @param _depth The depth of recursion.
     *
     * @return The modified description with placeholders replaced.
     */
    doPlaceholders(card: Card, overrideText = '', _depth = 0): string {
        let reg = /{ph:(.*?)}/;

        let text = overrideText;
        if (!overrideText) {
            text = card.text || '';
        }

        let running = true;
        while (running) {
            const regedDesc = reg.exec(text);

            // There is nothing more to extract
            if (!regedDesc) {
                running = false;
                break;
            }

            // Get the capturing group result
            const key = regedDesc[1];

            card.replacePlaceholders();
            const _replacement = card.placeholder;
            if (!_replacement) {
                throw new Error('Card placeholder not found.');
            }

            let replacement = _replacement[key] as string | Card;

            if (replacement instanceof Card) {
                // The replacement is a card
                const onlyShowName = (
                    game.config.advanced.getReadableCardNoRecursion
                    || !game.player.detailedView
                );

                const alwaysShowFullCard = game.config.advanced.getReadableCardAlwaysShowFullCard;

                replacement = onlyShowName && !alwaysShowFullCard ? game.functions.color.fromRarity(replacement.displayName, replacement.rarity) : game.interact.card.getReadable(replacement, -1, _depth + 1);
            }

            text = game.functions.color.fromTags(text.replace(reg, replacement));
        }

        // Replace spell damage placeholders
        reg = /\$(\d+?)/;

        running = true;
        while (running) {
            const regedDesc = reg.exec(text);
            if (!regedDesc) {
                running = false;
                break;
            }

            // Get the capturing group result
            const key = regedDesc[1];
            const replacement = game.lodash.parseInt(key) + game.player.spellDamage;

            text = text.replace(reg, replacement.toString());
        }

        return text;
    },

    /**
     * Returns a card in a user readable state. If you game.log the result of this, the user will get all the information they need from the card.
     *
     * @param card The card
     * @param i If this is set, this function will add `[i]` to the beginning of the card. This is useful if there are many different cards to choose from.
     * @param _depth The depth of recursion. DO NOT SET THIS MANUALLY.
     *
     * @returns The readable card
     */
    // eslint-disable-next-line complexity
    getReadable(card: Card, i = -1, _depth = 0): string {
        /**
         * If it should show detailed errors regarding depth.
         */
        const showDetailedError: boolean = (game.config.general.debug || game.config.info.branch !== 'stable' || game.player.detailedView);

        if (_depth > 0 && game.config.advanced.getReadableCardNoRecursion) {
            if (showDetailedError) {
                return 'RECURSION ATTEMPT BLOCKED';
            }

            return '...';
        }

        if (_depth > game.config.advanced.getReadableCardMaxDepth) {
            if (showDetailedError) {
                return 'MAX DEPTH REACHED';
            }

            return '...';
        }

        let sb = '';

        let text = (card.text || '').length > 0 ? ` (${card.text}) ` : ' ';

        // Extract placeholder value, remove the placeholder header and footer
        if (card instanceof Card && (card.placeholder ?? /\$(\d+?)/.test(card.text || ''))) {
            text = this.doPlaceholders(card, text, _depth);
        }

        let cost = `{${card.cost}} `;

        let costType = 'mana';
        if (card instanceof Card && card.costType) {
            costType = card.costType;
        }

        switch (costType) {
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

        const {displayName} = card;

        if (i !== -1) {
            sb += `[${i}] `;
        }

        sb += cost;
        sb += game.functions.color.fromRarity(displayName, card.rarity);

        if (card.stats) {
            sb += `<bright:green> [${card.stats?.join(' / ')}]</bright:green>`;
        } else if (card.type === 'Location') {
            const {durability} = card;
            let maxDurability = durability;
            let maxCooldown = card.cooldown;

            if (card instanceof Card) {
                maxDurability = card.backups.init.durability;
                maxCooldown = card.backups.init.cooldown ?? 0;
            }

            sb += ' {';
            sb += `<bright:green>Durability: ${durability} / `;
            sb += maxDurability;
            sb += '</bright:green>, ';

            sb += `<cyan>Cooldown: ${card.cooldown} / ${maxCooldown}</cyan>`;
            sb += '}';
        }

        sb += text;
        sb += `<yellow>(${card.type})</yellow>`;

        if (!(card instanceof Card)) {
            return sb;
        }

        const excludedKeywords = new Set<CardKeyword>(['Magnetic', 'Corrupt']);
        const keywords = Object.keys(card.keywords).filter(k => !excludedKeywords.has(k as CardKeyword));
        const keywordsString = keywords.length > 0 ? ` <gray>{${keywords.join(', ')}}</gray>` : '';
        sb += keywordsString;

        for (const k of ['Frozen', 'Dormant', 'Immune']) {
            if (!card[k.toLowerCase() as keyof Card]) {
                continue;
            }

            sb += ` <gray>(${k})</gray>`;
        }

        const sleepy = (card.sleepy) ?? (card.attackTimes && card.attackTimes <= 0) ? ' <gray>(Sleepy)</gray>' : '';
        sb += sleepy;

        return sb;
    },

    /**
     * Shows information from the card, game.log's it and waits for the user to press enter.
     *
     * @param card The card
     * @param help If it should show a help message which displays what the different fields mean.
     */
    view(card: Card, help = true) {
        const _card = this.getReadable(card);
        const _class = `<gray>${card.classes.join(' / ')}</gray>`;

        let tribe = '';
        let spellSchool = '';
        let locCooldown = '';

        const {type} = card;

        switch (type) {
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

        game.log(_card + (tribe || spellSchool || locCooldown) + ` [${_class}]`);

        game.log();
        game.pause();
    },

    spawnInDiyCard(player: Player) {
        // Don't allow ai's to get diy cards
        if (player.ai) {
            return;
        }

        const list = game.functions.card.getAll(false).filter(card => /DIY \d+/.test(card.name));
        const card = game.lodash.sample(list);
        if (!card) {
            return;
        }

        card.plr = player;
        player.addToHand(card);
    },
};
