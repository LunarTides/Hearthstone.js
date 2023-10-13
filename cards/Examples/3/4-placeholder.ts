// Created by Hand

import assert from 'node:assert';
import {type Blueprint} from '@Game/types.js';

export const blueprint: Blueprint = {
    name: 'Placeholder Example',

    // The things with `{...}` will be replaced in the `placeholder` function.
    text: 'Battlecry: Gain mana equal to the turn counter. (Currently {turns}, {laugh}, {turns}, {next thing is} {test}, {placeholder without replacement})',

    cost: 0,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 53,

    cast(plr, self) {
        // Gain mana equal to the turn counter.

        // The turn counter goes up at the beginning of each player's turn.
        // So we devide the number by 2 and round the result up in order to get a more traditional turn count.
        const turns = Math.ceil(game.turns / 2);

        plr.gainMana(turns);
    },

    // This function will be run every tick, and will replace the placeholders in the description with this function's return value.
    placeholders(plr, self) {
        // All occurances of `{0}` will be replaced by the value in `game.turns`
        // All `{1}` will be replaced by 'haha lol'
        // All `{next thing is}` will be replaced by 'The next thing is:'
        // The `{placeholder without replacement}` doesn't have a replacement, so it will remain '{placeholder without replacement}'
        const turns = Math.ceil(game.turns / 2);

        // Here we use static placeholders. Static placeholders are placeholders that don't change. For example, `{1}` here is a static placeholder since you can just add `haha lol`
        // to the description and it wouldn't change anything.
        // The use of static placeholders is discouraged, but we'll use them for demonstration purposes.
        //
        // This should give us "Battlecry: Gain mana equal to the turn counter. (Currently x, haha lol, x, The next thing is: test, {placeholder without replacement})"
        // where x is the turn counter
        return {turns, laugh: 'haha lol', test: 'test', 'next thing is': 'The next thing is:'};
    },

    test(plr, self) {
        self.replacePlaceholders();
        assert.equal(self.text, 'Battlecry: Gain mana equal to the turn counter. (Currently {ph:0} placeholder {/ph}, {ph:1} placeholder {/ph}, {ph:0} placeholder {/ph}, {ph:next thing is} placeholder {/ph} {ph:10} placeholder {/ph}, {placeholder without replacement})');
        assert.equal(game.interact.card.doPlaceholders(self), 'Battlecry: Gain mana equal to the turn counter. (Currently 1, haha lol, 1, The next thing is: test, {placeholder without replacement})');

        game.endTurn();
        game.endTurn();

        assert.equal(game.interact.card.doPlaceholders(self), 'Battlecry: Gain mana equal to the turn counter. (Currently 2, haha lol, 2, The next thing is: test, {placeholder without replacement})');
    },
};
