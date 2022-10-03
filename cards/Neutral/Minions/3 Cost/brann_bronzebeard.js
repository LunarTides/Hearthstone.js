module.exports = {
    name: "Brann Bronzebeard",
    stats: [2, 4],
    desc: "Your Battlecries trigger twice.",
    mana: 3,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Core",

    passive(plr, game, card, trigger) {
        if (!card.passiveCheck(trigger, "minionsPlayed", null, plr)) return;
        
        trigger[1].activateDefault("battlecry");
    }
}