module.exports = {
    name: "Sludge Belcher",
    stats: [3, 5],
    desc: "Taunt. Deathrattle: Summon a 1/2 Slime with Taunt.",
    mana: 5,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Rare",
    set: "Naxxramas",
    keywords: ["Taunt"],
    id: 209,

    deathrattle(plr, game, self) {
        let minion = new game.Card("Sludge Belcher Slime", plr);
        game.summonMinion(minion, plr);
    }
}
