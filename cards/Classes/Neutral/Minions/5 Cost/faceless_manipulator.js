module.exports = {
    name: "Faceless Manipulator",
    stats: [3, 3],
    desc: "Battlecry: Choose a minion and become a copy of it.",
    mana: 5,
    tribe: "None",
    class: "Neutral",
    rarity: "Epic",
    set: "Legacy",

    battlecry(plr, game, self) {
        let target = game.interact.selectTarget("Become a copy of a minion.", false, null, "minion");
        if (!target) return -1;

        let clone = game.functions.cloneCard(target, plr); // Create an exact copy of the target

        self.destroy();
        game.summonMinion(clone, plr, false);
    }
}
