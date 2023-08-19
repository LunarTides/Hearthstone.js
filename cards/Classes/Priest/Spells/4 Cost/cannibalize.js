// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Cannibalize",
    desc: "Destroy a minion. Restore its Health to all friendly characters.",
    mana: 4,
    type: "Spell",
    class: "Priest",
    rarity: "Rare",
    set: "Return to Naxxramas",
    spellClass: "Shadow",
    id: 241,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget("Destroy a minion. Restore its Health to all friendly characters.", self, null, "minion");
        if (!target) return -1;

        game.functions.doPlayerTargets(plr, (t) => {
            t.addHealth(target.getHealth());
        });

        target.kill();
    }
}
