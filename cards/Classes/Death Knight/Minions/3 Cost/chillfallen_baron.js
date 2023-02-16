module.exports = {
    name: "Chillfallen Baron",
    stats: [2, 2],
    desc: "Battlecry and Deathrattle: Draw a card.",
    mana: 3,
    tribe: "Undead",
    class: "Death Knight",
    rarity: "Common",
    set: "Core",
    id: 187,

    battlecry(plr, game, self) {
        plr.drawCard();
    },
    
    deathrattle(plr, game, self) {
        plr.drawCard();
    }
}
