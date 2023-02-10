module.exports = {
    name: "Zephrys the Great",
    stats: [3, 2],
    desc: "Battlecry: If your deck has no duplicates, wish for the perfect card.",
    mana: 2,
    tribe: "Elemental",
    class: "Neutral",
    rarity: "Legendary",
    set: "Saviors of Uldum",
    id: 168,

    battlecry(plr, game, self) {
        if (!game.functions.highlander(plr)) return;

        let list = Object.values(game.functions.getCards()).filter(c => c.set == "Legacy");

        // The real zephrys is a lot more complicated but i'm not gonna bother, sorry
        game.interact.discover("Choose the perfect card.", list);
    }
}
