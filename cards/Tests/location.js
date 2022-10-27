module.exports = {
    name: "Location Test",
    stats: [1, 3],
    desc: "Deal 1 damage to a minion and give it +2 Attack.",
    mana: 1,
    tribe: "",
    class: "Warrior",
    rarity: "Rare",
    set: "Murder at Castle Nathria",
    cooldown: 2,

    use(plr, game, self) {
        let target = game.functions.selectTarget("Deal 1 damage to a minion and give it +2 Attack.", false, null, "minion");

        if (!target) return -1;

        game.functions.attackMinion(1, target);
        target.addStats(2, 0);
    }
}