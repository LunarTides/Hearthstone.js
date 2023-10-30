/**
 * This is the vanilla card creator.
 * @module Vanilla Card Creator
 */

import rl from 'readline-sync';
import { type Card as VanillaCard } from '@hearthstonejs/vanillatypes';
import { type Blueprint, type CardClass, type CardRarity, type MinionTribe, type SpellSchool } from '../../src/types.js';
import { createGame } from '../../src/internal.js';
import * as lib from './lib.js';

const { game } = createGame();

/**
 * Create a card from a vanilla card.
 *
 * @param card The vanilla card
 * @param debug If it should use debug mode
 */
// eslint-disable-next-line complexity
export function create(card: VanillaCard, debug: boolean, overrideType?: lib.CcType) {
    // Harvest info
    let cardClass = game.lodash.capitalize(card.cardClass ?? 'Neutral') as CardClass;
    const COLLECTIBLE = card.collectible ?? false;
    const COST = card.cost ?? 0;
    const { name: NAME } = card;
    let rarity: CardRarity = 'Free';
    if (card.rarity) {
        rarity = game.lodash.capitalize(card.rarity) as CardRarity;
    }

    let text = card.text ?? '';
    const TYPE = game.lodash.capitalize(card.type);

    // Minion info
    const ATTACK = card.attack ?? -1;
    const HEALTH = card.health ?? -1;
    let races: MinionTribe[] = [];
    if (card.races) {
        races = card.races.map(r => game.lodash.capitalize(r) as MinionTribe);
    }

    // Spell info
    let spellSchool: SpellSchool = 'None';
    if (card.spellSchool) {
        spellSchool = game.lodash.capitalize(card.spellSchool) as SpellSchool;
    }

    // Weapon Info
    const DURABILITY = card.durability ?? -1;

    // Get hero power desc
    let hpCost = 2;
    let hpText = '';

    const HERO_POWER = game.functions.card.vanilla.getAll().find(c => c.dbfId === card.heroPowerDbfId);
    if (HERO_POWER) {
        hpCost = HERO_POWER.cost!;
        hpText = HERO_POWER.text!;
    }

    // Modify the text
    text = text.replaceAll('\n', ' ');
    text = text.replaceAll('[x]', '');

    const CLASSES = game.functions.card.getClasses() as CardClass[];
    CLASSES.push('Neutral');

    while (!CLASSES.includes(cardClass)) {
        cardClass = game.lodash.startCase(game.input('<red>Was not able to find the class of this card.\nWhat is the class of this card? </red>')) as CardClass;
    }

    const REAL_NAME = game.input('Override name (this will set \'name\' to be the displayname instead) (leave empty to not use display name): ') || NAME;

    let blueprint: Blueprint;

    switch (TYPE) {
        case 'Minion': {
            blueprint = {
                name: REAL_NAME,
                stats: [ATTACK, HEALTH],
                text,
                cost: COST,
                type: TYPE,
                // TODO: Add support for more than 1 tribe. #334
                tribe: races[0] || 'None',
                classes: [cardClass],
                rarity,
                id: 0,
            };

            break;
        }

        case 'Spell': {
            blueprint = {
                name: REAL_NAME,
                text,
                cost: COST,
                type: TYPE,
                spellSchool,
                classes: [cardClass],
                rarity,
                id: 0,
            };

            break;
        }

        case 'Weapon': {
            blueprint = {
                name: REAL_NAME,
                stats: [ATTACK, DURABILITY],
                text,
                cost: COST,
                type: TYPE,
                classes: [cardClass],
                rarity,
                id: 0,
            };

            break;
        }

        case 'Hero': {
            blueprint = {
                name: REAL_NAME,
                text,
                cost: COST,
                type: TYPE,
                hpText,
                hpCost,
                classes: [cardClass],
                rarity,
                id: 0,
            };

            break;
        }

        case 'Location': {
            blueprint = {
                name: REAL_NAME,
                text,
                cost: COST,
                type: TYPE,
                durability: HEALTH,
                cooldown: 2,
                classes: [cardClass],
                rarity,
                id: 0,
            };

            break;
        }

        default: {
            throw new TypeError(`${TYPE} is not a valid type!`);
        }
    }

    if (!COLLECTIBLE) {
        blueprint.uncollectible = true;
    }

    if (REAL_NAME !== NAME) {
        blueprint.displayName = NAME;
    }

    let cctype: lib.CcType = 'Vanilla';
    if (overrideType) {
        cctype = overrideType;
    }

    lib.create(cctype, TYPE, blueprint, undefined, undefined, debug);
}

/**
 * Prompt the user to pick a card, then create it.
 *
 * @returns If a card was created
 */
export function main(debug = false, overrideType?: lib.CcType) {
    game.log('Hearthstone.js Vanilla Card Creator (C) 2022\n');

    const VANILLA_CARDS = game.functions.card.vanilla.getAll();

    if (game.config.general.debug) {
        debug = !rl.keyInYN('Do you want the card to actually be created?');
    }

    let running = true;
    while (running) {
        const CARD_NAME = game.input('\nName / dbfId (Type \'back\' to cancel): ');
        if (game.interact.shouldExit(CARD_NAME)) {
            running = false;
            break;
        }

        let filteredCards = VANILLA_CARDS.filter(c => c.name.toLowerCase() === CARD_NAME.toLowerCase() || c.dbfId === game.lodash.parseInt(CARD_NAME));
        filteredCards = game.functions.card.vanilla.filter(filteredCards, false, true);

        if (filteredCards.length <= 0) {
            game.log('Invalid card.\n');
            continue;
        }

        let card;

        if (filteredCards.length > 1) {
            // Prompt the user to pick one
            for (const [INDEX, VANILLA_CARD] of filteredCards.entries()) {
                // Get rid of useless information
                delete VANILLA_CARD.elite;
                delete VANILLA_CARD.heroPowerDbfId;
                delete VANILLA_CARD.artist;
                delete VANILLA_CARD.flavor;
                delete VANILLA_CARD.mechanics;

                const { id: ID, ...CARD } = VANILLA_CARD;

                game.log(`\n${INDEX + 1}:`);
                game.log(CARD);
            }

            const PICKED = game.lodash.parseInt(game.input(`Pick one (1-${filteredCards.length}): `));
            if (!PICKED || !filteredCards[PICKED - 1]) {
                game.log('Invalid number.\n');
                continue;
            }

            card = filteredCards[PICKED - 1];
        } else {
            card = filteredCards[0];
        }

        game.log(`Found '${card.name}'\n`);

        create(card, debug, overrideType);
    }

    return true;
}
