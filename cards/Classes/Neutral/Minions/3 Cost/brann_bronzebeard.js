module.exports = {
    name: "Brann Bronzebeard",
    stats: [2, 4],
    desc: "Your Battlecries trigger twice.",
    mana: 3,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Core",
    id: 43,

    passive(plr, game, card, key, val) {
        if (!card.passiveCheck([key, val], "minionsPlayed", null, plr)) return;
        
        val.activate("battlecry");
    }
}
