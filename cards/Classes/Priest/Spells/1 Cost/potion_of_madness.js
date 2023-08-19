// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Potion of Madness",
    desc: "Gain control of an enemy minion with 2 or less Attack until end of turn.",
    mana: 1,
    type: "Spell",
    class: "Priest",
    rarity: "Common",
    set: "Mean Streets of Gadgetzan",
    spellClass: "Shadow",
    id: 170,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget("Gain control of an enemy minion with 2 or less Attack until end of turn.", self, "enemy", "minion");
        if (!target || target.getAttack() > 2) return -1;

        let backup = game.functions.cloneCard(target);
        let clone = game.functions.cloneCard(target);
        clone.plr = plr;
        clone.sleepy = false;
        clone.resetAttackTimes();

        target.destroy();
        game.summonMinion(clone, plr);

        game.functions.addEventListener("EndTurn", true, () => {
            clone.destroy();
            game.summonMinion(backup, plr.getOpponent());
        }, 1);
    }
}
