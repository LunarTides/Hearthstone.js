module.exports = {
    name: "Sleetbreaker",
    stats: [3, 2],
    desc: "&BBattlecry:&R Add a Windchill to your hand.",
    mana: 2,
    type: "Minion",
    tribe: "Elemental",
    class: "Shaman",
    rarity: "Rare",
    id: 308,

    battlecry(plr, game, self) {
        let card = new game.Card("Windchill", plr);

        plr.addToHand(card);
    }
}
