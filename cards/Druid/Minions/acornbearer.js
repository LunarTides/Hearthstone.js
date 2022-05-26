module.exports = {
    name: "Acornbearer",
    stats: [2, 1],
    desc: "Deathrattle: Add two 1/1 Squirrels to your hand.",
    mana: 1,
    tribe: "None",
    class: "Druid",
    rarity: "Common",
    set: "Rise of Shadows",

    deathrattle(plr, game, card) {
        plr.hand.push(new game.Minion("Acornbearer Squirrel", plr));
        plr.hand.push(new game.Minion("Acornbearer Squirrel", plr));
    }
}