module.exports = {
    name: "Noxious Cadaver",
    stats: [1, 2],
    desc: "Battlecry: Deal 2 damage to an enemy and your hero.",
    mana: 1,
    tribe: "Undead",
    class: "Death Knight",
    rarity: "Rare",
    set: "Core",
    runes: "B",
    id: 183,

    battlecry(plr, game, self) {
        let target = game.interact.selectTarget("Deal 2 damage to an enemy.", false, "enemy");
        if (!target) return -1;

        game.attack(2, target);
        game.attack(2, plr);
    }
}