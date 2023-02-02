module.exports = {
    name: "Bash",
    desc: "Deal 3 damage. Gain 3 Armor.",
    mana: 2,
    class: "Warrior",
    rarity: "Common",
    set: "The Grand Tournament",
    id: 108,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Deal 3 damage.", true);
        if (!target) return -1;

        game.attack(3, target);
        plr.armor += 3;
    }
}
