// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Death Knight Obliterate",
    displayName: "Obliterate",
    desc: "Destroy a minion. Deal 3 damage to your hero.",
    mana: 2,
    type: "Spell",
    class: "Death Knight",
    rarity: "Epic",
    set: "Core",
    runes: "B",
    id: 9,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget("Destroy a minion.", true, null, "minion");
        if (!target) return -1;

        target.kill();
        game.attack(3, plr);
    }
}
