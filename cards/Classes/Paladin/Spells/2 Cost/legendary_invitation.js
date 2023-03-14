module.exports = {
    name: "Legendary Invitation",
    desc: "&BDiscover&R a &BLegendary&R minion from another class. It costs (0).",
    mana: 2,
    class: "Paladin",
    rarity: "Free",
    set: "Murder at Castle Nathria",
    uncollectible: true,

    cast(plr, game, self) {
        let list = Object.values(game.functions.getCards());
        list = list.filter(c => game.functions.getType(c) == "Minion" && c.rarity == "Legendary" && c.class != plr.heroClass);
        if (list.length <= 0) return;

        let card = game.interact.discover("Discover a Legendary minion from another class.", list);
        if (!card) return -1;

        card.mana = 0;
    }
}
