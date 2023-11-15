// Created by the Vanilla Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Jade Idol',
    text: '<b>Choose One -</b> Summon a <b>Jade Golem</b>; or Shuffle 3 copies of this card into your deck.',
    cost: 1,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Druid'],
    rarity: 'Rare',
    id: 84,

    cast(plr, self) {
        // Choose One - Summon a Jade Golem; or Shuffle 3 copies of this card into your deck.
        game.interact.chooseOne(1, ['Summon a Jade Golem', () => {
            // Summon a Jade Golem
            const jade = game.functions.card.createJade(plr);
            game.summonMinion(jade, plr);
        }], ['Shuffle 3 copies of this card into your deck', () => {
            // Shuffle
            for (let i = 0; i < 3; i++) {
                plr.shuffleIntoDeck(self.imperfectCopy());
            }
        }]);
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};
