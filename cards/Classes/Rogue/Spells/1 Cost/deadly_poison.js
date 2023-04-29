module.exports = {
    name: "Deadly Poison",
    desc: "Give your weapon +2 Attack.",
    mana: 1,
    type: "Spell",
    class: "Rogue",
    rarity: "Free",
    set: "Legacy",
    spellClass: "Nature",
    id: 273,

    cast(plr, game, self) {
        if (!plr.weapon) return -1;

        plr.weapon.addStats(2, 0);
    }
}
