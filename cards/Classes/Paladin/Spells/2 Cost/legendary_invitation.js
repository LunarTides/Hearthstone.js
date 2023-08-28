// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Legendary Invitation",
    desc: "&BDiscover&R a &BLegendary&R minion from another class. It costs (0).",
    mana: 2,
    type: "Spell",
    class: "Paladin",
    rarity: "Free",
    set: "Murder at Castle Nathria",
    uncollectible: true,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let list = game.functions.getCards();
        list = list.filter(c => c.type == "Minion" && c.rarity == "Legendary" && c.class != plr.heroClass);
        if (list.length <= 0) return;

        let card = game.interact.discover("Discover a Legendary minion from another class.", list, false);
        if (!card) return -1;

        //card.mana = 0;
        card.addEnchantment("mana = 0", self);
        plr.addToHand(card);
    }
}
