module.exports = {
    name: "Alexstrasza",
    stats: [8, 8],
    desc: "Battlecry: Set a hero's remaining Health to 15.",
    mana: 9,
    tribe: "Dragon",
    class: "Neutral",
    rarity: "Legendary",
    set: "Legacy",

    battlecry(plr, game, card) {
        let target = game.interact.selectTarget("Set a hero's remaining Health to 15.", false, null, "hero");
        if (!target) return -1;

        target.health = 15;
    }
}
