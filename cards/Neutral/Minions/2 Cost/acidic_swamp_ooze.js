module.exports = {
    name: "Acidic Swamp Ooze",
    stats: [3, 2],
    desc: "Battlecry: Destroy your opponent's weapon.",
    mana: 2,
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "Core",

    battlecry(plr, game, card) {
        game.getOtherPlayer(plr).destroyWeapon(true);
    }
}