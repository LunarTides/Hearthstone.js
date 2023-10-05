// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Galakrond the Wretched",
    displayName: "Galakrond, the Wretched",
    text: "<b>Battlecry:</b> Summon {amount} random Demon{plural}.",
    cost: 7,
    type: "Hero",
    classes: ["Warlock"],
    rarity: "Legendary",
    hpText: "Summon two 1/1 Imps.",
    hpCost: 2,
    id: 71,

    battlecry(plr, self) {
        // Summon 1 random Demon.
        const amount = game.functions.card.galakrondFormula(self.storage.invokeCount);

        for (let i = 0; i < amount; i++) {
            // Find all demons
            const possible_cards = game.functions.card.getAll().filter(c => c.type == "Minion" && game.functions.card.matchTribe(c.tribe!, "Demon"));

            // Choose a random one
            let card = game.lodash.sample(possible_cards);
            if (!card) break;
            
            // Summon it
            card = new game.Card(card.name, plr);
            game.summonMinion(card, plr);
        }
    },

    heropower(plr, self) {
        // Summon two 1/1 Imps.
        for (let i = 0; i < 2; i++) {
            const card = new game.Card("Draconic Imp", plr);
            if (!card) break;

            game.summonMinion(card, plr);
        }
    },

    invoke(plr, self) {
        game.functions.card.galakrondBump(self, "invokeCount");
    },

    placeholders(plr, self) {
        const amount = game.functions.card.galakrondFormula(self.storage.invokeCount);
        const multiple = amount > 1;
        const plural = multiple ? "s" : "";

        return {amount, plural};
    }
}
