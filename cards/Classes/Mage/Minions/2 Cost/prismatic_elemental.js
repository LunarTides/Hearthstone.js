// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Prismatic Elemental",
    stats: [1, 3],
    desc: "&BBattlecry:&R &BDiscover&R a spell from any class. It costs (1) less.",
    type: "Minion",
    mana: 2,
    tribe: "Elemental",
    class: "Mage",
    rarity: "Epic",
    id: 317,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let list = game.functions.getCards().filter(c => !c.class.includes("Neutral"));
        let card = game.interact.discover("Discover a spell from any class.", list, false);
        if (!card) return -1;

        //card.mana -= 1;
        card.addEnchantment("-1 mana", self);
        plr.addToHand(card);
    }
}
