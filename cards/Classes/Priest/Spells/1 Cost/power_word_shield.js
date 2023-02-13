module.exports = {
    name: "Power Word Shield",
    displayName: "Power Word: Shield",
    desc: "Give a minion +2 Health. Draw a card.",
    mana: 1,
    class: "Priest",
    rarity: "Free",
    set: "Legacy",
    spellClass: "Holy",
    id: 171,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Give a minion +2 Health.", true, null, "minion");
        if (!target) return -1;

        target.addStats(0, 2);
        plr.drawCard();
    }
}
