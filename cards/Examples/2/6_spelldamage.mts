// Created by Hand

import { Blueprint } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Spell Damage Example",

    // Put a $ sign before the number to show spell damage in the description.
    // It's like a mini-placeholder, which is something you will learn about in the next chapter.
    // If you have debug mode enabled, do `/eval game.player.spellDamage += 5` in order to see it working.
    desc: "Deal $3 damage to the enemy hero. As long as this is in your hand, your spell damage increases by 1 every time you play a card.",

    mana: 0,
    type: "Spell",
    spellSchool: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 42,

    cast(plr, game, self) {
        // Put the $ sign here to make the game apply spell damage correctly.
        // Ideally you wouldn't need to do that and the game would figure it out, but i wasn't able to get it to work.
        game.attack("$3", plr.getOpponent());
    }

}
