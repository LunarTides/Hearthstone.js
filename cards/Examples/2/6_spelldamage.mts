// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Spell Damage Example",

    // Put a $ sign before the number to show spell damage in the description.
    // It's like a mini-placeholder, which is something you will learn about in the next chapter.
    desc: "Deal $3 damage to the enemy hero. As long as this is in your hand, your spell damage increases by 1 every time you play a card.",

    mana: 0,
    type: "Spell",
    spellClass: "General",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 43,

    cast(plr, game, self) {
        // Put the $ sign here to make the game apply spell damage correctly.
        // Ideally you wouldn't need to do that and the game would figure it out, but i wasn't able to get it to work.
        game.attack("$3", plr.getOpponent());
    },

    passive(plr, game, self, key, value) {
        if (key != "PlayCard" || game.player != plr) return;

        // This is a bit buggy since the spell damage gets reset right before the `PlayCard` event gets broadcast, but you get the point.
        // Try pasting this line when in game, while you have this in your hand, to get a better example: `/eval game.player.spellDamage += 5`

        plr.spellDamage += 1;
    }
}

export default blueprint;
