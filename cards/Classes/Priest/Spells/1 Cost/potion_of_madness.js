module.exports = {
    name: "Potion of Madness",
    desc: "Gain control of an enemy minion with 2 or less Attack until end of turn.",
    mana: 1,
    class: "Priest",
    rarity: "Common",
    set: "Mean Streets of Gadgetzan",
    spellClass: "Shadow",
    id: 170,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Gain control of an enemy minion with 2 or less Attack until end of turn.", true, "enemy", "minion");
        if (!target || target.getAttack() > 2) return -1;

        let backup = game.functions.cloneCard(target);
        let clone = game.functions.cloneCard(target);
        clone.plr = plr;
        clone.sleepy = false;
        clone.resetAttackTimes();

        target.destroy();
        game.summonMinion(clone, plr);

        game.functions.addPassive("turnEnds", () => {}, () => {
            clone.destroy();
            game.summonMinion(backup, plr.getOpponent());
        }, 1);
    }
}