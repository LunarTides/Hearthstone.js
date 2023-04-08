module.exports = {
    name: "Floop's Gloop",
    displayName: "Floop's Glorious Gloop",
    desc: "Whenever a minion dies this turn, gain 1 Mana Crystal this turn only.",
    mana: 1,
    class: "Druid",
    rarity: "Legendary",
    set: "The Boomsday Project",
    spellClass: "Nature",
    id: 138,

    cast(plr, game, self) {
        // Gain Mana
        let remove = game.functions.addPassive("minionsKilled", true, () => {
            plr.refreshMana(1, plr.maxMaxMana);
        }, -1);

        game.functions.addPassive("turnEnds", (val) => {
            return game.player == plr;
        }, () => {
            remove();
        }, 1);
    }
}
