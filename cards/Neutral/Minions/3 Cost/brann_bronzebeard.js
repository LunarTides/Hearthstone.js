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
        // Checking trigger[1].hasBattlecry is not required since activateDefault checks it anyway but it's there for clarity.
        if (trigger[0] == "minionsPlayed" && trigger[1].hasBattlecry) {
            trigger[1].activateDefault("battlecry");
        }
    }
}