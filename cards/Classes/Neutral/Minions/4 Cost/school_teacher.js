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
        let list = game.functions.getCards();
        list = list.filter(c => c.type == "Spell" && c.mana <= 3);
        if (list.length <= 0) return;

        let card = game.interact.discover("Discover a spell that costs (3) or less to teach it.", list);
        if (!card) return;

        let minion = new game.Card("School Teacher Nagaling", plr);
        minion.desc = minion.desc.replace("{0}", card.displayName);
        minion.storage.push(card);

        plr.addToHand(minion);
    }
}
