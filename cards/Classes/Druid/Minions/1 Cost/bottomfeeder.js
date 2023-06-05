// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Bottomfeeder",
    stats: [1, 1],
    desc: "Deathrattle: Add a Bottomfeeder to the bottom of your deck with permanent +2/+2.",
    mana: 1,
    type: "Minion",
    tribe: "Beast",
    class: "Druid",
    rarity: "Epic",
    set: "Voyage to the Sunken City",
    id: 6,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, card) {
        const minion = new game.Card("Bottomfeeder", plr);

        minion.setStats(card.getAttack(), card.maxHealth);
        minion.addStats(2, 2);

        plr.addToBottomOfDeck(minion);
    }
}
