module.exports = {
    name: "Demon Hunter Starting Hero",
    displayName: "Illidan Stormrage",
    desc: "Demon hunter starting hero",
    mana: 0,
    type: "Hero",
    class: "Demon Hunter",
    rarity: "Free",
    set: "Core",
    hpDesc: "+1 Attack this turn.",
    hpCost: 1,
    uncollectible: true,
    id: 94,

    heropower(plr, game, self) {
        plr.addAttack(1);
    }
}
