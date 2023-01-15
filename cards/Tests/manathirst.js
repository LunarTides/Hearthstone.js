module.exports = {
    name: "Manathirst Test",
    stats: [1, 2],
    desc: "Battlecry: Freeze an enemy minion. Manathirst (6): Silence it first.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    uncollectible: true,

    battlecry(plr, game, self) {
        let [ret, prompt] = self.manathirst(6, "Silence then freeze an enemy minion.", "Freeze an enemy minion.");

        let target = game.functions.selectTarget(prompt, true, "enemy", "minion");
        if (!target) return -1;

        if (ret) target.silence();
        target.frozen = true;
    }
}
