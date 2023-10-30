// Created by the Custom Card Creator

import { type Blueprint } from '@Game/types.js';

export const BLUEPRINT: Blueprint = {
    name: 'Galakrond the Tempest',
    displayName: 'Galakrond, the Tempest',
    text: '<b>Battlecry:</b> Summon two {amount}/{amount} Storms with <b>Rush</b>.{weapon}',
    cost: 7,
    type: 'Hero',
    classes: ['Shaman'],
    rarity: 'Legendary',
    hpText: 'Summon a 2/1 Elemental with <b>Rush</b>.',
    hpCost: 2,
    id: 68,

    battlecry(plr, self) {
        // Summon two 1/1 Storms with Rush. (Equip a 5/2 Claw.)

        // Get the stats
        const AMOUNT = game.functions.card.galakrondFormula(self.storage.invokeCount as number);
        const SHOULD_GIVE_WEAPON = AMOUNT >= 7;

        // Summon the two minions
        for (let i = 0; i < 2; i++) {
            const MINION = game.createCard('Brewing Storm', plr);
            if (!MINION) {
                break;
            }

            MINION.setStats(AMOUNT, AMOUNT);
            game.summonMinion(MINION, plr);
        }

        if (!SHOULD_GIVE_WEAPON) {
            return;
        }

        // Give the weapon
        const WEAPON = game.createCard('Dragon Claw', plr);
        plr.setWeapon(WEAPON);
    },

    heropower(plr, self) {
        // Summon a 2/1 Elemental with Rush.
        const CARD = game.createCard('Windswept Elemental', plr);
        if (!CARD) {
            return;
        }

        game.summonMinion(CARD, plr);
    },

    invoke(plr, self) {
        self.galakrondBump('invokeCount');
    },

    placeholders(plr, self) {
        if (!self.storage.invokeCount) {
            return { amount: 0, plural: 's', plural2: 'They' };
        }

        const AMOUNT = game.functions.card.galakrondFormula(self.storage.invokeCount as number);
        const WEAPON = AMOUNT >= 7 ? ' Equip a 5/2 Claw.' : '';

        return { amount: AMOUNT, weapon: WEAPON };
    },
};
