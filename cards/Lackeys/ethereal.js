module.exports = {
    name: "Ethereal Lackey",
    type: "Minion",
    stats: [1, 1],
    desc: "Battlecry: Discover a spell.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",

    battlecry(plr, game) {
        game.functions.discover("Discover a spell.", 3, ['Spell']);
    }
}