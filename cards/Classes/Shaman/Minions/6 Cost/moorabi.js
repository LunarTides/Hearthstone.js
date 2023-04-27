module.exports = {
    name: "Moorabi",
    stats: [4, 4],
    desc: "Whenever another minion is &BFrozen&R, add a copy of it to your hand.",
    mana: 6,
    tribe: "None",
    class: "Shaman",
    rarity: "Legendary",
    id: 315,

    passive(plr, game, self, key, val) {
        if (key != "FreezeCard") return;
        if (val == self) return;

        let copy = new game.Card(val.name, plr);
        plr.addToHand(copy);
    }
}
