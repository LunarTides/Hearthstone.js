module.exports = {
    name: "Hunter Starting Hero",
    displayName: "Rexxar",
    desc: "Hunter starting hero",
    mana: 0,
    type: "Hero",
    class: "Hunter",
    rarity: "Free",
    set: "Core",
    hpDesc: "Deal 2 damage to the enemy hero.",
    uncollectible: true,
    id: 96,

    heropower(plr, game, self) {
        game.attack(2, plr.getOpponent());
    }
}
