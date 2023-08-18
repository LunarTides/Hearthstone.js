// Created by Hand

/**
 * @type {import("../../../src/types").Blueprint}
 */
module.exports = {
    name: "Spell Damage Example",
    stats: [1, 1],
    desc: "Deal $3 damage to the enemy hero. As long as this is in your hand, your spell damage increases by 1 every time you play a card.", // Put a $ sign before the number to add spell damage
    mana: 0,
    type: "Spell",
    spellClass: "General",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    /**
     * @type {import("../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        // Put the $ sign here to make the game apply spell damage correctly.
        game.attack("$3", plr.getOpponent());
    },

    /**
     * @type {import("../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, value) {
        if (key != "PlayCard" || game.player != plr) return;

        // This is a bit buggy since the spell damage gets reset right before the `PlayCard` event gets broadcast, but you get the point.
        // Try pasting this line when in game, while you have this in your hand, to get a better example: `/eval game.player.spellDamage += 5`

        plr.spellDamage += 1;
    }
}
