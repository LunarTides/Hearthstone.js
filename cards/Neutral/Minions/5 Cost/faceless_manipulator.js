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
        let target = game.functions.selectTarget("Become a copy of a minion.", false, null, "minion");
        if (!target) return -1;

        let clone = Object.assign(Object.create(Object.getPrototypeOf(target)), target); // Create an exact copy of the target
        clone.randomizeIds();

        self.destroy();
        game.summonMinion(clone, plr, false);
    }
}