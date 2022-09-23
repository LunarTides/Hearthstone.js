module.exports = {
    name: "Bottomfeeder",
    stats: [1, 1],
    desc: "Deathrattle: Add a Bottomfeeder to the bottom of your deck with permanent +2/+2.",
    mana: 1,
    tribe: "Beast",
    class: "Druid",
    rarity: "Epic",
    set: "Voyage to the Sunken City",

    deathrattle(plr, game, card) {
        const minion = new game.Minion("Bottomfeeder", plr);

        minion.setStats(card.stats[0], card.oghealth);
        minion.addStats(2, 2);

        plr.addToBottomOfDeck(minion);
    }
}