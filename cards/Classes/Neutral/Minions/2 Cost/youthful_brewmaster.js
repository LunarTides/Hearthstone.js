module.exports = {
    name: "Youthful Brewmaster",
    stats: [3, 2],
    desc: "Battlecry: Return a friendly minion from the battlefield to your hand.",
    mana: 2,
    tribe: "None",
    class: "Neutral",
    rarity: "Common",
    set: "Core",
    id: 40,

    battlecry(plr, game, card) {
        let target = game.interact.selectTarget("Choose a minion.", false, "self", "minion");

        if (!target) {
            return -1;
        }

        plr.addToHand(new game.Card(target.name, plr));
        target.destroy();
    }
}
