// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Tracking",
    desc: "Discover a card from your deck.",
    mana: 1,
    type: "Spell",
    class: "Hunter",
    rarity: "Free",
    set: "Legacy",
    id: 215,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let list = plr.deck;

        let card = game.interact.discover("Discover a card from your deck.", list, false);
        if (!card) return -1;

        plr.drawSpecific(card);
    }
}
