module.exports = {
    name: "Druid Starting Hero",
    displayName: "Malfurion Stormrage",
    desc: "Druid starting hero",
    mana: 0,
    class: "Druid",
    rarity: "Free",
    set: "Core",
    hpDesc: "+1 Attack this turn. +1 Armor.",

    heropower(plr, game, self) {
        plr.addAttack(1);
        plr.armor += 1;
    }
}
