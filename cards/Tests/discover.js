module.exports = {
    name: "Discover Test",
    desc: "Discover a card.",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",

    cast(plr, game) {
        game.functions.discover("Discover a card.");
    }
}