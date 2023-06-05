// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Dragonqueen Alexstrasza",
    stats: [8, 8],
    desc: "Battlecry: If your deck has no duplicates, add 2 other random Dragons to your hand. They cost (0).",
    mana: 9,
    type: "Minion",
    tribe: "Dragon",
    class: "Neutral",
    rarity: "Legendary",
    set: "Descent of Dragons",
    id: 164,
    conditioned: ["battlecry"],

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let list = game.functions.getCards().filter(c => c.type == "Minion" && game.functions.matchTribe(c.tribe, "Dragon"));

        for (let i = 0; i < 2; i++) {
            let card = game.functions.randList(list);
            card = new game.Card(card.name, plr);

            //card.mana = 0;
            card.addEnchantment("mana = 0", self);

            plr.addToHand(card);
        }
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    condition(plr, game, self) {
        return game.functions.highlander(plr);
    }
}
