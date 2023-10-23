import { createHash } from 'node:crypto';
import { type Dirent } from 'node:fs';
import { type VanillaCard } from '@hearthstonejs/vanillatypes';
import { type CardLike, type CardClass, type MinionTribe, type CardClassNoNeutral, type Blueprint, type CardType } from '@Game/types.js';
import { Card, CardError, type Player } from '../../internal.js';
import * as blueprints from '../../../cards/exports.js';

const vanilla = {
    /**
     * Returns all cards added to Vanilla Hearthstone.
     *
     * This will throw an error if the user has not run the vanilla card generator,
     *
     * @example
     * const vanillaCards = getAll();
     *
     * vanillaCards.forEach(vanillaCard => {
     *     game.log(vanillaCard.dbfId);
     * });
     *
     * @returns The vanilla cards
     */
    getAll(): VanillaCard[] {
        const fileLocation = '/vanillacards.json';
        if (game.functions.util.fs('exists', fileLocation)) {
            return JSON.parse(game.functions.util.fs('read', fileLocation) as string) as VanillaCard[];
        }

        throw new Error('Cards file not found! Run \'npm run script:vanilla:generator\' (requires an internet connection), then try again.');
    },

    /**
     * Filter out some useless vanilla cards
     *
     * @param cards The list of vanilla cards to filter
     * @param uncollectible If it should filter away uncollectible cards
     * @param dangerous If there are cards with a 'howToEarn' field, filter away any cards that don't have that.
     *
     * @returns The filtered cards
     *
     * @example
     * // The numbers here are not accurate, but you get the point.
     * assert(cards.length, 21022);
     *
     * cards = filter(cards, true, true);
     * assert(cards.length, 1002);
     *
     *
     * @example
     * // You can get a vanilla card by name using this
     * cards = cards.filter(c => c.name === "Brann Bronzebeard");
     * assert(cards.length, 15);
     *
     * cards = filter(cards, true, true);
     * assert(cards.length, 1);
     */
    filter(cards: VanillaCard[], uncollectible = true, dangerous = false, keepHeroSkins = false): VanillaCard[] {
        if (uncollectible) {
            cards = cards.filter(a => a.collectible);
        }

        cards = cards.filter(a => !a.id.startsWith('Prologue'));

        // Idk what 'PVPDR' means, but ok
        cards = cards.filter(a => !a.id.startsWith('PVPDR'));
        cards = cards.filter(a => !a.id.startsWith('DRGA_BOSS'));

        // Battlegrounds
        cards = cards.filter(a => !a.id.startsWith('BG'));

        // Tavern Brawl
        cards = cards.filter(a => !a.id.startsWith('TB'));
        cards = cards.filter(a => !a.id.startsWith('LOOTA_'));
        cards = cards.filter(a => !a.id.startsWith('DALA_'));
        cards = cards.filter(a => !a.id.startsWith('GILA_'));
        cards = cards.filter(a => !a.id.startsWith('BOTA_'));
        cards = cards.filter(a => !a.id.startsWith('TRLA_'));
        cards = cards.filter(a => !a.id.startsWith('DALA_'));
        cards = cards.filter(a => !a.id.startsWith('ULDA_'));
        cards = cards.filter(a => !a.id.startsWith('BTA_BOSS_'));
        cards = cards.filter(a => !a.id.startsWith('Story_'));

        // Book of mercenaries
        cards = cards.filter(a => !a.id.startsWith('BOM_'));
        cards = cards.filter(a => !a.mechanics || !a.mechanics.includes('DUNGEON_PASSIVE_BUFF'));
        cards = cards.filter(a => a.set && !['battlegrounds', 'placeholder', 'vanilla', 'credits'].includes(a.set.toLowerCase()));
        cards = cards.filter(a => a.set && !a.set.includes('PLACEHOLDER_'));
        cards = cards.filter(a => !a.mercenariesRole);

        cards = cards.filter(a => !a.battlegroundsBuddyDbfId);
        cards = cards.filter(a => !a.battlegroundsDarkmoonPrizeTurn);
        cards = cards.filter(a => !a.battlegroundsHero);
        cards = cards.filter(a => !a.battlegroundsNormalDbfId);
        cards = cards.filter(a => !a.battlegroundsPremiumDbfId);
        cards = cards.filter(a => !a.battlegroundsSkinParentId);
        cards = cards.filter(a => !a.isBattlegroundsBuddy);

        const filteredCards: VanillaCard[] = [];

        for (const a of cards) {
            // If the set is `HERO_SKINS`, only include it if it's id is `HERO_xx`, where the x's are a number.
            if (a.set && a.set.includes('HERO_SKINS')) {
                if (keepHeroSkins && /HERO_\d\d/.test(a.id)) {
                    filteredCards.push(a);
                }

                continue;
            }

            filteredCards.push(a);
        }

        cards = filteredCards;

        if (dangerous) {
            // If any of the cards have a 'howToEarn' field, filter away any cards that don't have that
            const _cards = cards.filter(a => a.howToEarn);
            if (_cards.length > 0) {
                cards = _cards;
            }
        }

        return cards;
    },
};

export const cardFunctions = {
    /**
     * Vanilla card related functions
     */
    vanilla,

    /**
     * Returns the card with the name `name`.
     *
     * @param name The name
     * @param refer If this should call `getCardById` if it doesn't find the card from the name
     *
     * @returns The blueprint of the card
     */
    getFromName(name: string, refer = true): Card | undefined {
        const id = this.getFromId(game.lodash.parseInt(name), false);
        if (id && refer) {
            return id;
        }

        return this.getAll(false).find(c => c.name.toLowerCase() === name.toLowerCase());
    },

    /**
     * Returns the card with the id of `id`.
     *
     * @param id The id
     * @param refer If this should call `getCardByName` if it doesn't find the card from the id
     *
     * @returns The blueprint of the card
     */
    getFromId(id: number, refer = true): Card | undefined {
        const card = this.getAll(false).find(c => c.id === id);

        if (!card && refer) {
            return this.getFromName(id.toString(), false);
        }

        return card;
    },

    /**
     * Returns all cards added to Hearthstone.js
     *
     * @param uncollectible Filter out all uncollectible cards
     * @param cards This defaults to `game.cards`, which contains all cards in the game.
     *
     * @returns Cards
     */
    getAll(uncollectible = true): Card[] {
        if (game.cards.length <= 0) {
            game.cards = game.blueprints.map(card => new Card(card.name, game.player));
        }

        return game.cards.filter(c => !c.uncollectible || !uncollectible);
    },

    /**
     * Returns if `classes` includes `cardClass` (also Neutral logic).
     */
    validateClasses(classes: CardClass[], cardClass: CardClass): boolean {
        if (classes.includes('Neutral')) {
            return true;
        }

        return classes.includes(cardClass);
    },

    /**
     * Returns if the `cardTribe` is `tribe` or 'All'
     *
     * @param cardTribe
     * @param tribe
     *
     * @example
     * assert.equal(card.tribe, "Beast");
     *
     * // This should return true
     * const result = matchTribe(card.tribe, "Beast");
     * assert.equal(result, true);
     *
     * @example
     * assert.equal(card.tribe, "All");
     *
     * // This should return true
     * const result = matchTribe(card.tribe, "Beast");
     * assert.equal(result, true);
     */
    matchTribe(cardTribe: MinionTribe, tribe: MinionTribe): boolean {
        // If the card's tribe is "All".
        if (cardTribe === 'All') {
            return true;
        }

        return cardTribe.includes(tribe);
    },

    /**
     * Validates the blueprints.
     *
     * @returns If one or more blueprints were found invalid.
     */
    runBlueprintValidator() {
        // Validate the cards
        let valid = true;
        for (const card of game.blueprints) {
            const errorMessage = this.validateBlueprint(card);

            // Success
            if (errorMessage === true) {
                continue;
            }

            // Validation error
            game.log(`<red>Card <bold>'${card.name}'</bold> is invalid since ${errorMessage}</red>`);
            valid = false;
        }

        return valid;
    },

    /**
     * Imports all cards from a folder
     *
     * @returns Success
     */
    importAll() {
        this.generateExports();
        game.blueprints = Object.values(blueprints);

        if (!this.runBlueprintValidator()) {
            throw new Error('Some cards are invalid. Please fix these issues before playing.');
        }

        return true;
    },

    /**
     * Filters out all cards that are uncollectible in a list
     *
     * @param cards The list of cards
     *
     * @returns The cards without the uncollectible cards
     */
    accountForUncollectible(cards: CardLike[]): CardLike[] {
        return cards.filter(c => !c.uncollectible);
    },

    /**
     * Creates and returns a jade golem with the correct stats and cost for the player
     *
     * @param plr The jade golem's owner
     *
     * @returns The jade golem
     */
    createJade(plr: Player): Card {
        if (plr.jadeCounter < 30) {
            plr.jadeCounter += 1;
        }

        const count = plr.jadeCounter;
        const cost = (count < 10) ? count : 10;

        const jade = new Card('Jade Golem', plr);
        jade.setStats(count, count);
        jade.cost = cost;

        return jade;
    },

    /**
     * Returns all classes in the game
     *
     * @returns Classes
     *
     * @example
     * const classes = getClasses();
     *
     * assert.equal(classes, ["Mage", "Warrior", "Druid", ...])
     */
    getClasses(): CardClassNoNeutral[] {
        const classes: CardClassNoNeutral[] = [];

        for (const file of game.functions.util.fs('readdir', '/cards/StartingHeroes', { withFileTypes: true }) as Dirent[]) {
            // Something is wrong with the file name.
            if (!file.name.endsWith('.ts')) {
                continue;
            }

            // Remove ".ts"
            let name = file.name.slice(0, -3);

            // Remove underscores
            name = name.replaceAll('_', ' ');

            // Capitalize all words
            name = game.functions.util.capitalizeAll(name);

            const card = this.getFromName(name + ' Starting Hero');
            if (!card || card.classes[0] !== name as CardClassNoNeutral || card.type !== 'Hero' || !card.abilities.heropower || card.classes.includes('Neutral')) {
                game.logWarn('Found card in the startingheroes folder that isn\'t a starting hero. If the game crashes, please note this in your bug report. Name: ' + name + '. Error Code: StartingHeroInvalidHandler');
                continue;
            }

            classes.push(card.classes[0]);
        }

        return classes;
    },

    /**
     * Returns the result of the galakrond formula
     *
     * @param invokeCount How many times that the card has been invoked.
     */
    galakrondFormula(invokeCount: number) {
        const x = invokeCount;
        const y = Math.ceil((x + 1) / 2) + Math.round(x * 0.15);

        return y || 1;
    },

    createCardError(message: string) {
        return new CardError(message);
    },

    /**
     * Validates a blueprint
     *
     * @returns Success / Error message
     */
    validateBlueprint(blueprint: Blueprint): string | boolean {
        // These are the required fields for all card types.
        const requiredFieldsTable: { [x in CardType]: string[] } = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Minion: ['stats', 'tribe'],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Spell: ['spellSchool'],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Weapon: ['stats'],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Hero: ['hpText', 'hpCost'],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Location: ['durability', 'cooldown'],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Undefined: [],
        };

        // We trust the typescript compiler to do most of the work for us, but the type specific code is handled here.
        const required = requiredFieldsTable[blueprint.type];

        const unwanted = Object.keys(requiredFieldsTable);
        game.functions.util.remove(unwanted, blueprint.type);
        game.functions.util.remove(unwanted, 'Undefined');

        let result: string | boolean = true;
        for (const field of required) {
            // Field does not exist
            if (!blueprint[field as keyof Blueprint]) {
                result = `<bold>'${field}' DOES NOT</bold> exist for that card.`;
            }
        }

        for (const key of unwanted) {
            const fields = requiredFieldsTable[key as CardType];

            for (const field of fields) {
                // We already require that field. For example, both minions and weapons require stats
                if (required.includes(field)) {
                    continue;
                }

                // We have an unwanted field

                if (blueprint[field as keyof Blueprint]) {
                    result = `<bold>${field} SHOULD NOT</bold> exist on card type ${blueprint.type}.`;
                }
            }
        }

        return result;
    },

    generateExports() {
        let exportContent = '// This file has been automatically created. Do not change this file.\n';

        const list: string[] = [];
        game.functions.util.searchCardsFolder((fullPath, content) => {
            if (!content.includes('export const blueprint')) {
                return;
            }

            fullPath = fullPath.replace('.ts', '.js');
            const relPath = './' + fullPath.split('cards/')[1];

            list.push(relPath);
        });

        // Sort the list alphabetically so it will remain constant between different file system formats.
        for (const path of list.sort()) {
            const hash = createHash('sha256').update(path).digest('hex').toString().slice(0, 7);

            exportContent += `export { blueprint as c${hash} } from '${path}';\n`;
        }

        game.functions.util.fs('write', '/cards/exports.ts', exportContent);
        game.functions.util.fs('write', '/dist/cards/exports.js', exportContent);
    },

    reloadAll(_path?: string) {
        // TODO: Implement. #323
    },
};
