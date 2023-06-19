// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "The Lich King",
    stats: [8, 8],
    desc: "Taunt. At the end of your turn, add a random Lich King card to your hand.",
    mana: 8,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Legendary",
    set: "Knights of the Frozen Throne",
    keywords: ["Taunt"],
    id: 30,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "EndTurn" || game.player != plr) return;

        let cards = ["Anti-Magic Shell", "Army", "Goal", "Coil", "Grip", "Pact", "Frostmourne", "Obliterate"];
        let card = game.functions.randList(cards);

        card = `The Lich King's ${card}`;
        card = new game.Card(card, plr);

        plr.addToHand(card);
    }
}
