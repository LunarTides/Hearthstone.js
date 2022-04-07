module.exports = {
    name: "Kobold Lackey",
    type: "Minion",
    stats: [1, 1],
    desc: "Battlecry: Deal 2 damage.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",

    battlecry(plr, game) {
        var target = game.functions.selectTarget(`Deal ${2 + plr.spellDamage} damage.`);

        game.functions.spellDmg(target, 2);
    }
}