module.exports = {
    name: "Windchill",
    desc: "&BFreeze&R a minion. Draw a card.",
    mana: 1,
    class: "Shaman",
    rarity: "Common",
    spellClass: "Frost",
    id: 303,

    cast(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, true, null, "minion");
        if (!target) return -1;

        target.frozen = true;
        plr.drawCard();
    }
}
