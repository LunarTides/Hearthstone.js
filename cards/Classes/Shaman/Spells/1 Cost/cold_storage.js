module.exports = {
    name: "Cold Storage",
    desc: "&BFreeze&R a minion. Add a copy of it to your hand.",
    mana: 1,
    class: "Shaman",
    rarity: "Rare",
    spellClass: "Frost",
    id: 302,

    cast(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, true, null, "minion");
        if (!target) return -1;

        target.freeze();

        let copy = new game.Card(target.name, plr);
        plr.addToHand(copy);
    }
}
