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

    assert.equal(self.attack! - 1, self.blueprint.attack);
    assert.equal(self.health! - 1, self.blueprint.health);
};

export const blueprint: Blueprint = {
    name: 'Another Ability Example',
    text: '<b>Battlecry:</b> Give this minion +1/+1.',
    cost: 1,
    type: 'Minion',
    attack: 1,
    health: 2,
    tribe: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    collectible: false,
    id: 77,

    // If the function is named correctly, you can just write the name of the ability
    battlecry,

    // Otherwise, do `nameOfAbility: nameOfFunction`.
    test: theTestAbility,
};

