// Created by Hand

import assert from 'node:assert';
import { type Blueprint, type Ability } from '@Game/types.js';

// This is another way to write blueprints
// You might want to do this if you make a very complicated card
// however it is not as supported by scripts as the default method.
const battlecry: Ability = (plr, self) => {
    self.addStats(1, 1);
};

const theTestAbility: Ability = (plr, self) => {
    self.activate('battlecry');

    assert.equal(self.getAttack() - 1, self.blueprint.stats?.[0]);
    assert.equal(self.getHealth() - 1, self.blueprint.stats?.[1]);
};

export const blueprint: Blueprint = {
    name: 'Another Ability Example',
    stats: [1, 2],
    text: '<b>Battlecry:</b> Give this minion +1/+1.',
    cost: 1,
    type: 'Minion',
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 77,

    // If the function is named correctly, you can just write the name of the ability
    battlecry,

    // Otherwise, do `nameOfAbility: nameOfFunction`.
    test: theTestAbility,
};

