module.exports = {
    name: "Cathedral of Atonement",
    stats: [0, 3],
    desc: "Give a minion +2/+1 and draw a card.",
    mana: 3,
    class: "Priest",
    rarity: "Rare",
    set: "Murder at Castle Nathria",
    cooldown: 2,
    id: 237,

    use(plr, game, self) {
        let target = game.interact.selectTarget("Give a minion +2/+1.", true, null, "minion");
        if (!target) return -1;

        target.addStats(2, 1);
        plr.drawCard();
    }
}