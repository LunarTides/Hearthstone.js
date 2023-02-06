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
    id: 78,

    battlecry(plr, game, card) {
        game.passives.push((game, key, val) => {
            if (!card.passiveCheck([key, val], "spellsCast", null, plr)) return;

            val.activate("cast");
        });
    }
}
