module.exports = {
    name: "Druid Starting Hero",
    displayName: "Malfurion Stormrage",
    desc: "Druid starting hero",
    mana: 0,
    class: "Druid",
    rarity: "Free",
    set: "Core",

    heropower(plr, game, self) {
        plr.addAttack(1);
        plr.armor += 1;
    }
}
