module.exports = {
    name: "Bottomfeeder",
    stats: [1, 1],
    desc: "Deathrattle: Add a Bottomfeeder to the bottom of your deck with permanent +2/+2.",
    mana: 1,
    tribe: "Beast",
    class: "Druid",
    rarity: "Epic",
    set: "Voyage to the Sunken City",
    id: 6,

    deathrattle(plr, game, card) {
        const minion = new game.Card("Bottomfeeder", plr);

        minion.setStats(card.getAttack(), card.maxHealth);
        minion.addStats(2, 2);

        plr.addToBottomOfDeck(minion);
    }
}