// Created by the Custom Card Creator

import assert from 'node:assert';
import { type Blueprint } from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Death Knight Starting Hero',
    displayName: 'The Lich King',
    text: 'Death knight starting hero',
    cost: 0,
    type: 'Hero',
    hpText: 'Summon a 1/1 Ghoul with Charge. It dies at end of turn.',
    hpCost: 2,
    classes: ['Death Knight'],
    rarity: 'Free',
    uncollectible: true,
    id: 14,

    heropower(plr, self) {
        // Summon a 1/1 Ghoul with Charge. It dies at end of turn.

        // Create the Ghoul
        const minion = game.createCard('Death Knight Frail Ghoul', plr);

        // Summon the Ghoul
        game.summonMinion(minion, plr);

        // The `It dies at end of turn.` part is handled by the ghoul itself, so we don't need to do anything extra here
    },

    test(plr, self) {
        const minion = game.createCard('Death Knight Frail Ghoul', plr);

        const lookForMinion = () => game.board[plr.id].some(card => card.id === minion.id);

        // The minion shouldn't be on the board at first.
        assert(!lookForMinion());
        self.activate('heropower');

        // The minion should now be on the board.
        assert(lookForMinion());
    },
};
