module.exports = {
    name: "Demon Hunter Starting Hero",
    displayName: "Illidan Stormrage",
    desc: "Demon hunter starting hero",
    mana: 0,
    class: "Demon Hunter",
    rarity: "Free",
    set: "Core",
    hpDesc: "+1 Attack this turn.",
    hpCost: 1,
    uncollectible: true,

    heropower(plr, game, self) {
        plr.addAttack(1);
    }
}
