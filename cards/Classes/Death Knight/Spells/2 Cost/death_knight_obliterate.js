module.exports = {
    name: "Death Knight Obliterate",
    displayName: "Obliterate",
    desc: "Destroy a minion. Deal 3 damage to your hero.",
    mana: 2,
    class: "Death Knight",
    rarity: "Epic",
    set: "Core",
    runes: "B",
    id: 185,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Destroy a minion.", true, null, "minion");
        if (!target) return -1;

        target.kill();
        game.attack(3, plr);
    }
}