import { Card, Player } from "../../internal.js";
import { CardLike, VanillaCard, CardClass, MinionTribe, FunctionsValidateCardReturn, CardClassNoNeutral } from "@Game/types.js";
import { doImportCards, generateCardExports } from "../../helper/cards.js";
import { validateBlueprint } from "../../helper/validator.js";

const vanilla = {
    /**
     * Returns all cards added to Vanilla Hearthstone.
     * 
     * This will return an error message if the user has not run the vanilla card generator,
     * 
     * @param error The error message to return if the file doesn't exist. If this is not set, it will use a default error message.
     * 
     * @returns The vanilla cards, and an error message (if any)
     */
    getAll(error?: string): [VanillaCard[], string | null] {
        const fileLocation = "/vanillacards.json";
        if (game.functions.file.exists(fileLocation)) {
            return [JSON.parse(game.functions.file.read(fileLocation)) as VanillaCard[], null];
        }

        return [[], error ?? "<red>Cards file not found! Run 'npm run script:vanilla:generator' (requires an internet connection), then try again.</red>\n"];
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
     * cards = cards.filter(c => c.name == "Brann Bronzebeard");
     * assert(cards.length, 15);
     * 
     * cards = filter(cards, true, true);
     * assert(cards.length, 1);
     */
    filter(cards: VanillaCard[], uncollectible: boolean = true, dangerous: boolean = false, keepHeroSkins = false): VanillaCard[] {
        if (uncollectible) cards = cards.filter(a => a.collectible);
        cards = cards.filter(a => !a.id.startsWith("Prologue"));

        // Idk what 'PVPDR' means, but ok
        cards = cards.filter(a => !a.id.startsWith("PVPDR"));
        cards = cards.filter(a => !a.id.startsWith("DRGA_BOSS"));

        // Battlegrounds
        cards = cards.filter(a => !a.id.startsWith("BG"));

        // Tavern Brawl
        cards = cards.filter(a => !a.id.startsWith("TB"));
        cards = cards.filter(a => !a.id.startsWith("LOOTA_"));
        cards = cards.filter(a => !a.id.startsWith("DALA_"));
        cards = cards.filter(a => !a.id.startsWith("GILA_"));
        cards = cards.filter(a => !a.id.startsWith("BOTA_"));
        cards = cards.filter(a => !a.id.startsWith("TRLA_"));
        cards = cards.filter(a => !a.id.startsWith("DALA_"));
        cards = cards.filter(a => !a.id.startsWith("ULDA_"));
        cards = cards.filter(a => !a.id.startsWith("BTA_BOSS_"));
        cards = cards.filter(a => !a.id.startsWith("Story_"));

        // Book of mercenaries
        cards = cards.filter(a => !a.id.startsWith("BOM_"));
        cards = cards.filter(a => !a.mechanics || !a.mechanics.includes("DUNGEON_PASSIVE_BUFF"));
        cards = cards.filter(a => !a.battlegroundsNormalDbfId);
        cards = cards.filter(a => a.set && !["battlegrounds", "placeholder", "vanilla", "credits"].includes(a.set.toLowerCase()));
        cards = cards.filter(a => a.set && !a.set.includes("PLACEHOLDER_"));
        cards = cards.filter(a => !a.mercenariesRole);

        const filteredCards: VanillaCard[] = [];

        cards.forEach(a => {
            // If the set is `HERO_SKINS`, only include it if it's id is `HERO_xx`, where the x's are a number.
            if (a.set && a.set.includes("HERO_SKINS")) {
                if (keepHeroSkins && /HERO_\d\d/.test(a.id)) filteredCards.push(a);

                return;
            }
            filteredCards.push(a);
        });

        cards = filteredCards;
        
        if (dangerous) {
            // If any of the cards have a 'howToEarn' field, filter away any cards that don't have that
            const _cards = cards.filter(a => a.howToEarn);
            if (_cards.length > 0) cards = _cards;
        }

        return cards;
    },
}

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
    getFromName(name: string | number, refer: boolean = true): Card | null {
        let card = null;

        this.getAll(false).forEach(c => {
            if (typeof name == "number") return;

            if (c.name.toLowerCase() == name.toLowerCase()) card = c;
        });

        if (!card && refer) card = this.getFromId(name, false);

        return card;
    },

    /**
     * Returns the card with the id of `id`.
     * 
     * @param id The id
     * @param refer If this should call `getCardByName` if it doesn't find the card from the id
     * 
     * @returns The blueprint of the card
     */
    getFromId(id: number | string, refer: boolean = true): Card | null {
        const card = this.getAll(false).filter(c => c.id == id)[0];

        if (!card && refer) return this.getFromName(id.toString(), false);

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
    getAll(uncollectible: boolean = true, cards: CardLike[] = game.cards): Card[] {
        return cards.filter(c => !c.uncollectible || !uncollectible).map(card => new Card(card.name, game.player));
    },
    
    /**
     * Returns if `classes` includes `cardClass` (also Neutral logic).
     */
    validateClasses(classes: CardClass[], cardClass: CardClass): boolean {
        if (classes.includes("Neutral")) return true;

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
        if (/all/i.test(cardTribe)) return true;
        else return cardTribe.includes(tribe);
    },

    /**
     * Checks if a card is a valid card to put into a players deck
     * 
     * @param card The card to check
     * @param plr The player to check against
     * 
     * @returns Success | Errorcode
     */
    validateForDeck(card: Card, plr: Player): FunctionsValidateCardReturn {
        if (!card.classes.includes(plr.heroClass)) {
            // If it is a neutral card, it is valid
            if (card.classes.includes("Neutral")) {}
            else return "class";
        }
        if (card.uncollectible) return "uncollectible";

        // Runes
        if (card.runes && !plr.testRunes(card.runes)) return "runes";

        return true;
    },

    /**
     * Creates a PERFECT copy of a card, and sets some essential properties.
     * This is the exact same as `card.perfectCopy`, so use that instead.
     * 
     * @param card The card to clone
     * 
     * @returns Clone
     */
    clone(card: Card): Card {
        const clone = game.lodash.clone(card);

        clone.randomizeUUID();
        clone.sleepy = true;
        clone.turn = game.turns;

        return clone;
    },
    
    /**
     * Validates the blueprints.
     *
     * @returns If one or more blueprints were found invalid.
     */
    runBlueprintValidator() {
        // Validate the cards
        let valid = true;
        game.cards.forEach(card => {
            const errorMessage = validateBlueprint(card);

            // Success
            if (errorMessage === true) return;

            // Validation error
            game.log(`<red>Card <bold>'${card.name}'</bold> is invalid since ${errorMessage}</red>`);
            valid = false;
        });

        return valid;
    },
    
    /**
     * Imports all cards from a folder
     * 
     * @param path The path
     * 
     * @returns Success
     */
    importAll() {
        generateCardExports();
        doImportCards();

        if (!this.runBlueprintValidator()) {
            game.log(`<red>Some cards are invalid. Please fix these issues before playing.</red>`);
            game.input();
            process.exit(1);
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
     * Returns if the card specified has the ability to appear on the board.
     */
    canBeOnBoard(card: CardLike): boolean {
        return card.type === "Minion" || card.type === "Location";
    },

    /**
     * Creates and returns a jade golem with the correct stats and cost for the player
     * 
     * @param plr The jade golem's owner
     * 
     * @returns The jade golem
     */
    createJade(plr: Player): Card {
        if (plr.jadeCounter < 30) plr.jadeCounter += 1;
        const count = plr.jadeCounter;
        const cost = (count < 10) ? count : 10;

        const jade = new Card("Jade Golem", plr);
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

        game.functions.file.directory.read("/cards/StartingHeroes").forEach(file => {
            // Something is wrong with the file name.
            if (!file.name.endsWith(".ts")) return;

            // Remove ".ts"
            let name = file.name.slice(0, -3);

            // Remove underscores
            name = name.replaceAll("_", " ");

            // Capitalize all words
            name = game.functions.util.capitalizeAll(name);

            const card = this.getFromName(name + " Starting Hero");
            if (!card || card.classes[0] != name as CardClassNoNeutral || card.type != "Hero" || !card.abilities.heropower || card.classes.includes("Neutral")) {
                game.logWarn("Found card in the startingheroes folder that isn't a starting hero. If the game crashes, please note this in your bug report. Name: " + name + ". Error Code: StartingHeroInvalidHandler");
                return;
            }

            classes.push(card.classes[0] as CardClassNoNeutral);
        });

        return classes;
    },
}
