module.exports = {
    name: "Hunter Starting Hero",
    displayName: "Rexxar",
    desc: "Hunter starting hero",
    mana: 0,
    class: "Hunter",
    rarity: "Free",
    set: "Core",
    hpDesc: "Deal 2 damage to the enemy hero.",
    uncollectible: true,

    heropower(plr, game, self) {
        game.attack(2, plr.getOpponent());
    }
}
