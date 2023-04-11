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
        let spell;

        game.functions.addPassive("cardsPlayed", (val) => {
            spell = val;
            return val.type == "Spell" && game.player == plr;
        }, () => {
            spell.activate("cast");
        })
    }
}
