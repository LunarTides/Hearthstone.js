module.exports = {
    name: "Warlock Starting Hero",
    displayName: "Gul'dan",
    desc: "Warlock starting hero",
    mana: 0,
    class: "Warlock",
    rarity: "Free",
    set: "Core",

    heropower(plr, game, self) {
        plr.remHealth(2);
        plr.drawCard();
    }
}
