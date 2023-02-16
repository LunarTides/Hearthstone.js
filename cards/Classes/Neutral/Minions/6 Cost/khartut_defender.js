module.exports = {
    name: "Khartut Defender",
    stats: [3, 4],
    desc: "Taunt, Reborn. Deathrattle: Restore 3 Health to your hero.",
    mana: 6,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Rare",
    set: "Saviors of Uldum",
    keywords: ["Taunt", "Reborn"],
    id: 211,

    deathrattle(plr, game, self) {
        plr.addHealth(3);
    }
}
