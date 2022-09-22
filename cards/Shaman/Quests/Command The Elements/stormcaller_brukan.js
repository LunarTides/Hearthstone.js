module.exports = {
    name: "Stormcaller Bru'kan",
    stats: [7, 7],
    desc: "Battlecry: For the rest of the game, your spells cast twice.",
    mana: 5,
    tribe: "None",
    class: "Shaman",
    rarity: "Free",
    set: "United in Stormwind",
    uncollectible: true,

    battlecry(plr, game, card) {
        game.passives.push((game, trigger) => {
            if (trigger[0] == "spellsCast" && trigger[1].hasCast) {
                trigger[1].activateDefault("cast");
            }
        })
    }
}