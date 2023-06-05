// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Astalor Protector",
    displayName: "Astalor, the Protector",
    stats: [5, 5],
    desc: "Battlecry: Add Astalor, the Flamebringer to your hand. Manathirst (8): Gain 5 Armor.",
    mana: 5,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "March of the Lich King",
    uncollectible: true,
    id: 148,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        plr.addToHand(new game.Card("Astalor Flamebringer", plr));

        let manathirst = self.manathirst(8);

        if (manathirst) plr.armor += 5;
    }
}
