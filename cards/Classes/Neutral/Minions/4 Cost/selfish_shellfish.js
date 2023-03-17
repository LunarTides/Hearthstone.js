module.exports = {
    name: "Selfish Shellfish",
    stats: [7, 7],
    desc: "&BDeathrattle:&R Your opponent draws 2 cards.",
    mana: 4,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Common",
    set: "Voyage to the Sunken City",
    id: 293,

    deathrattle(plr, game, self) {
        for (let i = 0; i < 2; i++) plr.getOpponent().drawCard();
    }
}
