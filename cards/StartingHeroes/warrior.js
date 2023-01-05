module.exports = {
    name: "Warrior Starting Hero",
    displayName: "Garrosh Hellscream",
    desc: "Warrior starting hero",
    mana: 0,
    class: "Warrior",
    rarity: "Free",
    set: "Core",
    hpDesc: "Gain 2 Armor.",

    heropower(plr, game, self) {
        plr.armor += 2;
    }
}
