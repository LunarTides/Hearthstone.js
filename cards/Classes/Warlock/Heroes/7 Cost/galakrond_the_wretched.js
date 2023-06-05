// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Galakrond the Wretched",
    displayName: "Galakrond, the Wretched",
    desc: "&BBattlecry:&R Summon {amount} random Demon{plural}.",
    mana: 7,
    type: "Hero",
    class: "Warlock",
    rarity: "Legendary",
    hpDesc: "Summon two 1/1 Imps.",
    hpCost: 2,
    id: 324,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        // Look in `Galakrond, the Nightmare` for an explanation of this formula
        const x = self.invoke_count;
        const y = Math.ceil((x + 1) / 2) + Math.round(x * 0.15);

        const amount = y || 1;

        for (let i = 0; i < amount; i++) {
            const possible_cards = game.functions.getCards().filter(c => c.type == "Minion" && game.functions.matchTribe(c.tribe, "Demon"));

            let card = game.functions.randList(possible_cards);
            if (!card) break;
            
            card = new game.Card(card.name, plr);
            game.summonMinion(card, plr);
        }
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        for (let i = 0; i < 2; i++) {
            const card = new game.Card("Draconic Imp", plr);
            if (!card) break;

            game.summonMinion(card, plr);
        }
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
