module.exports = {
    name: "Warlock Starting Hero",
    displayName: "Gul'dan",
    desc: "Warlock starting hero",
    mana: 0,
    class: "Warlock",
    rarity: "Free",
    set: "Core",
    hpDesc: "Draw a card and take 2 damage.",

    heropower(plr, game, self) {
        plr.remHealth(2);
        plr.drawCard();
    }
}
