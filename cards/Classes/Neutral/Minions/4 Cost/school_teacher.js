module.exports = {
    name: "School Teacher",
    stats: [4, 4],
    desc: "Battlecry: Add a 1/1 Nagaling to your hand. Discover a spell that costs (3) or less to teach it.",
    mana: 4,
    tribe: "Naga",
    class: "Neutral",
    rarity: "Epic",
    set: "Voyage to the Sunken City",
    id: 191,

    battlecry(plr, game, self) {
        // Discover
        let list = Object.values(game.functions.getCards());
        list = list.filter(c => game.functions.getType(c) == "Spell" && c.mana <= 3);
        if (list.length <= 0) return;

        let card = game.interact.discover("Discover a spell that costs (3) or less to teach it.", list, 3, false);
        card = new game.Card(card.name, plr);
        if (!card) return;

        let minion = new game.Card("School Teacher Nagaling", plr);
        minion.desc = minion.desc.replace("{0}", card.displayName);
        minion.storage.push(card);

        plr.addToHand(minion);
    }
}
