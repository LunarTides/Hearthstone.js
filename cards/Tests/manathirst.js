module.exports = {
    name: "Manathirst Test",
    stats: [1, 2],
    desc: "Battlecry: Freeze an enemy minion. Manathirst (6): Silence it first.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",

    battlecry(plr, game, self) {
        const manathirst = plr.maxMana >= 6;
        let sb = "";
        if (manathirst) sb += "Silence then freeze";
        else sb += "Freeze";

        sb += " an enemy minion.";
        
        let target = game.functions.selectTarget(sb, true, "enemy", "minion");
        if (!target) return -1;

        if (manathirst) target.silence();
        target.frozen = true;
    }
}
