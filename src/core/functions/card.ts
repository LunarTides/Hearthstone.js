import { createHash } from 'node:crypto';
import { type Dirent } from 'node:fs';
import { type Card as VanillaCard } from '@hearthstonejs/vanillatypes';
import { type CardLike, type CardClass, type MinionTribe, type CardClassNoNeutral, type Blueprint, type CardType } from '@Game/types.js';
import { Card, CardError, type Player } from '../../internal.js';
import * as blueprints from '../../../cards/exports.js';

const VANILLA = {
    /**
     * Returns all cards added to Vanilla Hearthstone.
     *
     * This will throw an error if the user has not run the vanilla card generator,
     *
     * @example
     * const VANILLA_CARDS = getAll();
     *
     * for (const VANILLA_CARD of VANILLA_CARD) {
     *     game.log(VANILLA_CARD.dbfId);
     * }
     *
     * @returns The vanilla cards
     */
    getAll(): VanillaCard[] {
        const FILE_LOCATION = '/vanillacards.json';
        if (game.functions.util.fs('exists', FILE_LOCATION)) {
            return JSON.parse(game.functions.util.fs('read', FILE_LOCATION) as string) as VanillaCard[];
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

        const FILTERED_CARDS: VanillaCard[] = [];

        for (const VANILLA_CARD of cards) {
            // If the set is `HERO_SKINS`, only include it if it's id is `HERO_xx`, where the x's are a number.
            if (VANILLA_CARD.set && VANILLA_CARD.set.includes('HERO_SKINS')) {
                if (keepHeroSkins && /HERO_\d\d/.test(VANILLA_CARD.id)) {
                    FILTERED_CARDS.push(VANILLA_CARD);
                }

                continue;
            }

            FILTERED_CARDS.push(VANILLA_CARD);
        }

        cards = FILTERED_CARDS;

        if (dangerous) {
            // If any of the cards have a 'howToEarn' field, filter away any cards that don't have that
            const CARDS = cards.filter(a => a.howToEarn);
            if (CARDS.length > 0) {
                cards = CARDS;
            }
        }

        return cards;
    },
};

export const CARD_FUNCTIONS = {
    /**
     * Vanilla card related functions
     */
    vanilla: VANILLA,

    /**
     * Returns the card with the name `name`.
     *
     * @param refer If this should call `getCardById` if it doesn't find the card from the name
     *
     * @example
     * const CARD = getFromName('The Coin');
     *
     * assert.ok(CARD instanceof Card);
     * assert.equal(CARD.name, 'The Coin');
     */
    getFromName(name: string, refer = true): Card | undefined {
        const ID = this.getFromId(game.lodash.parseInt(name), false);
        if (ID && refer) {
            return ID;
        }

        return this.getAll(false).find(c => c.name.toLowerCase() === name.toLowerCase());
    },

    /**
     * Returns the card with the id of `id`.
     *
     * @param refer If this should call `getCardByName` if it doesn't find the card from the id
     *
     * @example
     * const CARD = getFromId(2);
     *
     * assert.ok(CARD instanceof Card);
     * assert.equal(CARD.name, 'The Coin');
     */
    getFromId(id: number, refer = true): Card | undefined {
        const CARD = this.getAll(false).find(c => c.id === id);

        if (!CARD && refer) {
            return this.getFromName(id.toString(), false);
        }

        return CARD;
    },

    /**
     * Returns all cards added to Hearthstone.js
     *
     * @param uncollectible If it should filter out all uncollectible cards
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
     * @example
     * assert.equal(card.tribe, "Beast");
     *
     * // This should return true
     * const RESULT = matchTribe(card.tribe, "Beast");
     * assert.equal(RESULT, true);
     *
     * @example
     * assert.equal(card.tribe, "All");
     *
     * // This should return true
     * const RESULT = matchTribe(card.tribe, "Beast");
     * assert.equal(RESULT, true);
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
        for (const BLUEPRINT of game.blueprints) {
            const ERROR_MESSAGE = this.validateBlueprint(BLUEPRINT);

            // Success
            if (ERROR_MESSAGE === true) {
                continue;
            }

            // Validation error
            game.log(`<red>Card <bold>'${BLUEPRINT.name}'</bold> is invalid since ${ERROR_MESSAGE}</red>`);
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

        const COUNT = plr.jadeCounter;
        const COST = (COUNT < 10) ? COUNT : 10;

        const JADE = new Card('Jade Golem', plr);
        JADE.setStats(COUNT, COUNT);
        JADE.cost = COST;

        return JADE;
    },

    /**
     * Returns all classes in the game
     *
     * @example
     * const CLASSES = getClasses();
     *
     * assert.equal(CLASSES, ["Mage", "Warrior", "Druid", ...])
     */
    getClasses(): CardClassNoNeutral[] {
        const CLASSES: CardClassNoNeutral[] = [];

        for (const FILE of game.functions.util.fs('readdir', '/cards/StartingHeroes', { withFileTypes: true }) as Dirent[]) {
            // Something is wrong with the file name.
            if (!FILE.name.endsWith('.ts')) {
                continue;
            }

            // Remove ".ts"
            let name = FILE.name.slice(0, -3);

            // Remove underscores
            name = name.replaceAll('_', ' ');

            // Capitalize all words
            name = game.lodash.startCase(name);

            const CARD = this.getFromName(name + ' Starting Hero');
            if (!CARD || CARD.classes[0] !== name as CardClassNoNeutral || CARD.type !== 'Hero' || !CARD.abilities.heropower || CARD.classes.includes('Neutral')) {
                game.logWarn('Found card in the startingheroes folder that isn\'t a starting hero. If the game crashes, please note this in your bug report. Name: ' + name + '. Error Code: StartingHeroInvalidHandler');
                continue;
            }

            CLASSES.push(CARD.classes[0]);
        }

        return CLASSES;
    },

    /**
     * Returns the result of the galakrond formula
     *
     * @param invokeCount How many times that the card has been invoked.
     */
    galakrondFormula(invokeCount: number) {
        const X = invokeCount;
        const Y = Math.ceil((X + 1) / 2) + Math.round(X * 0.15);

        return Y || 1;
    },

    /**
     * Creates a new CardError with the provided message.
     */
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
        const REQUIRED_FIELDS_TABLE: { [x in CardType]: string[] } = {
            Minion: ['stats', 'tribe'],
            Spell: ['spellSchool'],
            Weapon: ['stats'],
            Hero: ['hpText', 'hpCost'],
            Location: ['durability', 'cooldown'],
            Undefined: [],
        };

        // We trust the typescript compiler to do most of the work for us, but the type specific code is handled here.
        const REQUIRED = REQUIRED_FIELDS_TABLE[blueprint.type];

        const UNWANTED = Object.keys(REQUIRED_FIELDS_TABLE);
        game.functions.util.remove(UNWANTED, blueprint.type);
        game.functions.util.remove(UNWANTED, 'Undefined');

        let result: string | boolean = true;
        for (const FIELD of REQUIRED) {
            // Field does not exist
            if (!blueprint[FIELD as keyof Blueprint]) {
                result = `<bold>'${FIELD}' DOES NOT</bold> exist for that card.`;
            }
        }

        for (const KEY of UNWANTED) {
            const FIELDS = REQUIRED_FIELDS_TABLE[KEY as CardType];

            for (const FIELD of FIELDS) {
                // We already require that field. For example, both minions and weapons require stats
                if (REQUIRED.includes(FIELD)) {
                    continue;
                }

                // We have an unwanted field

                if (blueprint[FIELD as keyof Blueprint]) {
                    result = `<bold>${FIELD} SHOULD NOT</bold> exist on card type ${blueprint.type}.`;
                }
            }
        }

        return result;
    },

    generateExports() {
        let exportContent = '// This file has been automatically generated. Do not change this file.\n';

        const LIST: string[] = [];
        game.functions.util.searchCardsFolder((fullPath, content) => {
            if (!content.includes('export const BLUEPRINT')) {
                return;
            }

            fullPath = fullPath.replace('.ts', '.js');
            const RELATIVE_PATH = './' + fullPath.split('cards/')[1];

            LIST.push(RELATIVE_PATH);
        });

        // Sort the list alphabetically so it will remain constant between different file system formats.
        for (const PATH of LIST.sort()) {
            const HASH = createHash('sha256').update(PATH).digest('hex').toString().slice(0, 7).toUpperCase();

            exportContent += `export { BLUEPRINT as C${HASH} } from '${PATH}';\n`;
        }

        game.functions.util.fs('write', '/cards/exports.ts', exportContent);
        game.functions.util.fs('write', '/dist/cards/exports.js', exportContent);
    },

    reloadAll(_path?: string) {
        // TODO: Implement. #323
    },
};
