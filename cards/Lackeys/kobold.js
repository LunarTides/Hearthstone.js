module.exports = {
    name: "Kobold Lackey",
    stats: [1, 1],
    desc: "Battlecry: Deal 2 damage.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",
    uncollectible: true,
    id: 91,

    battlecry(plr, game) {
        let target = game.interact.selectTarget(`Deal ${2 + plr.spellDamage} damage.`);
        if (!target) return -1;

        game.functions.spellDmg(target, 2);
    }
}
