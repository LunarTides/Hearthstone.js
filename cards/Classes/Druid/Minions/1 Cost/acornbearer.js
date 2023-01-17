module.exports = {
    name: "Acornbearer",
    stats: [2, 1],
    desc: "Deathrattle: Add two 1/1 Squirrels to your hand.",
    mana: 1,
    tribe: "None",
    class: "Druid",
    rarity: "Common",
    set: "Rise of Shadows",
    id: 5,

    deathrattle(plr, game, card) {
        plr.addToHand(new game.Card("Acornbearer Squirrel", plr));
        plr.addToHand(new game.Card("Acornbearer Squirrel", plr));
    }
}