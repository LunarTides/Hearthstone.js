module.exports = {
    name: "Rune Test",
    stats: [1, 2],
    desc: "2x Frost; Battlecry: Freeze an enemy minion. Manathirst (6): Silence it first.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",
    runes: "FF",

    battlecry(plr, game, self) {
        if (!plr.testRunes("Frost", 2)) return;

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
