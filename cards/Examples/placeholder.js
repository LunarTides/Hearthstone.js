module.exports = {
    name: "Placeholder Example",
    desc: "This is an example for using {0} like {example1}, {example2}{delimiter}{space}{example1}. Current turn: {turn}",
    stats: [1, 1],
    mana: 0,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    id: "phe",
    uncollectible: true,

    placeholders(plr, game, self) {
        // This needs to return an Object

        return {0: game.functions.parseTags("&BPlaceholders&R"), "example1": "Hello", "example2": "World", "delimiter": ",", "space": " ", "turn": Math.ceil(game.turns / 2)};
    }
}
