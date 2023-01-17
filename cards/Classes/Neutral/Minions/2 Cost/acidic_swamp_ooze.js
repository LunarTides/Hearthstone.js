module.exports = {
    name: "Acidic Swamp Ooze",
    stats: [3, 2],
    desc: "Battlecry: Destroy your opponent's weapon.",
    mana: 2,
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "Core",
    id: 36,

    battlecry(plr, game, card) {
        plr.getOpponent().destroyWeapon(true);
    }
}