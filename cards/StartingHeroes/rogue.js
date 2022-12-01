module.exports = {
    name: "Rogue Starting Hero",
    displayName: "Valeera Sanguinar",
    desc: "Rogue starting hero",
    mana: 0,
    class: "Rogue",
    rarity: "Free",
    set: "Core",

    heropower(plr, game, self) {
        const wpn = new game.Card("Wicked Knife", plr);

        plr.setWeapon(wpn);
    }
}
