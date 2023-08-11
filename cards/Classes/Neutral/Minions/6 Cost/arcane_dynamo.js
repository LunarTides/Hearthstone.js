// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Arcane Dynamo",
    stats: [3, 4],
    desc: "Battlecry: Discover a spell that costs (5) or more.",
    mana: 6,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "The Boomsday Project",
    id: 193,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let list = game.functions.getCards();
        list = list.filter(c => c.type == "Spell" && c.mana >= 5 && [plr.heroClass, "Neutral"].includes(c.class));
        if (list.length <= 0) return;

        let card = game.interact.discover("Discover a spell that costs (5) or more", list);
        if (!card) return -1;

        plr.addToHand(card);
    }
}
