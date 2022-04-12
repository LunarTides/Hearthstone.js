module.exports = {
    name: "Deathrattle Test",
    type: "Minion",
    stats: [2, 1],
    desc: "Deathrattle: Summon a random 2-Cost minion.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",

    deathrattle(plr, game) {
        // filter out all cards that aren't 2-cost minions
        var target = game.functions.selectTarget(`Deal ${2 + plr.spellDamage} damage.`);

        game.functions.spellDmg(target, 2);
    }
}