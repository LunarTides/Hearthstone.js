// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Seance",
    desc: "Choose a minion. Add a copy of it to your hand.",
    mana: 2,
    type: "Spell",
    class: "Priest",
    rarity: "Common",
    set: "Rastakhan's Rumble",
    spellClass: "Shadow",
    id: 73,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget("Add a copy of a minion to your hand.", self, null, "minion");

        if (!target) return -1;

        plr.addToHand(new game.Card(target.name, plr));
    }
}
