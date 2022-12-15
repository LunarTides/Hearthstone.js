module.exports = {
    name: "Embalming Ritual",
    desc: "Give a minion Reborn.",
    mana: 1,
    class: "Priest",
    rarity: "Common",
    set: "Saviors of Uldum",

    cast(plr, game, card) {
        let target = game.interact.selectTarget("Give a minion Reborn.", true, null, "minion");

        if (!target) {
            return -1;
        }

        target.addKeyword("Reborn");
    }
}
