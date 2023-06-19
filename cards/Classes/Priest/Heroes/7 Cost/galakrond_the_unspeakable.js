// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Galakrond The Unspeakable",
    displayName: "Galakrond, the Unspeakable",
    desc: "&BBattlecry:&R Destroy {amount} random enemy minion{plural}.",
    mana: 7,
    type: "Hero",
    class: "Priest",
    rarity: "Legendary",
    hpDesc: "Add a random Priest minion to your hand.",
    hpCost: 2,
    id: 34,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        // Look in `Galakrond, the Nightmare` for an explanation of this formula
        const x = self.invoke_count;
        const y = Math.ceil((x + 1) / 2) + Math.round(x * 0.15);

        const amount = y || 1;

        for (let i = 0; i < amount; i++) {
            const board = game.board[plr.getOpponent().id];

            const minion = game.functions.randList(board, false);
            if (!minion) continue;

            minion.kill();
        }
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        const possible_cards = game.functions.getCards().filter(c => c.type == "Minion" && c.class == "Priest");
        if (possible_cards.length <= 0) return;

        let card = game.functions.randList(possible_cards);
        card = new game.Card(card.name, plr);

        plr.addToHand(card);
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    invoke(plr, game, self) {
        if (!self.invoke_count) self.invoke_count = 0;
        if (self.invoke_count >= 3) self.invoke_count = 3;

        self.invoke_count++;
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    placeholders(plr, game, self) {
        const x = self.invoke_count;
        const y = Math.ceil((x + 1) / 2) + Math.round(x * 0.15);

        const amount = y || 1;
        const multiple = amount > 1;
        const plural = multiple ? "s" : "";

        return {"amount": amount, "plural": plural};
    }
}
