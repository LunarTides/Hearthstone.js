module.exports = {
    name: "Elise the Enlightened",
    stats: [5, 5],
    desc: "Battlecry: If your deck has no duplicates, duplicate your hand.",
    mana: 5,
    tribe: "None",
    class: "Druid",
    rarity: "Legendary",
    set: "Saviors of Uldum",
    id: 156,

    battlecry(plr, game, self) {
        if (!game.functions.highlander(plr)) return;

        // Duplicate the players hand
        let _hand = [];

        plr.hand.forEach(c => {
            if ((plr.hand.length + _hand.length) >= 10) return;
            let copy = game.functions.cloneCard(c);

            _hand.push(copy);
        });

        plr.hand = [...plr.hand, ..._hand]; // Wtf
    }
}
