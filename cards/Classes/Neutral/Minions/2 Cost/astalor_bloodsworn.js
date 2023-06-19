// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Astalor Bloodsworn",
    stats: [2, 2],
    desc: "Battlecry: Add Astalor, the Protector to your hand. Manathirst (5): Deal 2 damage.",
    mana: 2,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "March of the Lich King",
    id: 18,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let manathirst = self.manathirst(5);

        if (!manathirst) {
            plr.addToHand(new game.Card("Astalor Protector", plr));
            return;
        };

        let target = game.interact.selectTarget("Deal 2 damage.", true);
        if (!target) return -1;

        game.attack(2, target);

        plr.addToHand(new game.Card("Astalor Protector", plr));
    }
}
