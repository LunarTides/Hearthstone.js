module.exports = {
    name: "Spiritsinger Umbra",
    stats: [3, 4],
    desc: "After you summon a minion, trigger its Deathrattle effect.",
    mana: 4,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Journey to Un'Goro",
    id: 50,

    passive(plr, game, card, key, val) {
        if (!card.passiveCheck([key, val], ["minionsSummoned", "minionsPlayed"], null, plr)) return;
        
        val.activate("deathrattle");
    }
}
