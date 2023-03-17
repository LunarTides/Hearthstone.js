module.exports = {
    name: "Kobold Librarian",
    stats: [2, 1],
    desc: "&BBattlecry:&R Draw a card. Deal 2 damage to your hero.",
    mana: 1,
    tribe: "None",
    class: "Warlock",
    rarity: "Common",
    set: "Kobolds & Catacombs",
    id: 289,

    battlecry(plr, game, self) {
        plr.drawCard();
        game.attack(2, plr);
    }
}
