module.exports = {
    name: "Spiritsinger Umbra",
    stats: [3, 4],
    desc: "After you summon a minion, trigger its Deathrattle effect.",
    mana: 4,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Journey to Un'Goro",

    passive(plr, game, card, trigger) {
        // Checking trigger[1].hasDeathrattle is not required since activateDefault checks it anyway but it's there for clarity.
        if (trigger[0] == "minionsSummoned" || trigger[0] == "minionsPlayed") {
            if (trigger[1].hasDeathrattle && card.passiveCheck(trigger)) {
                trigger[1].activateDefault("deathrattle");
            }
        }
    }
}