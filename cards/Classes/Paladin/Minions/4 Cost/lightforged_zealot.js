// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Lightforged Zealot",
    stats: [4, 2],
    desc: "&BBattlecry: &RIf your deck has no Neutral cards, equip a 4/2 Truesilver Champion.",
    mana: 4,
    type: "Minion",
    tribe: "None",
    class: "Paladin",
    rarity: "Rare",
    set: "Descent of Dragons",
    id: 264,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        // Check for Neutral cards.
        let neutral_cards = plr.deck.filter(c => c.class.includes("Neutral"));
        if (neutral_cards.length > 0) return;

        // There are no Neutral cards in the player's deck.
        let weapon = new game.Card("Truesilver Champion", plr);
        plr.setWeapon(weapon);
    }
}
