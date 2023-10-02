// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Galakrond the Nightmare",
    displayName: "Galakrond, the Nightmare",
    text: "<b>Battlecry:</b> Draw {amount} card{plural}. {plural2} costs (0).",
    cost: 7,
    type: "Hero",
    classes: ["Rogue"],
    rarity: "Legendary",
    hpText: "Add a <b>Lackey</b> to your hand.",
    hpCost: 2,
    id: 67,

    battlecry(plr, self) {
        // Draw {amount} cards. They cost (0).

        // Get the amount of cards to draw
        const amount = game.functions.galakrondFormula(self.storage.invokeCount);

        for (let i = 0; i < amount; i++) {
            const card = plr.drawCard();
            if (!(card instanceof game.Card)) return;

            // Set the cost to 0
            card.addEnchantment("cost = 0", self);
        }
    },

    heropower(plr, self) {
        // Add a lacky to your hand.
        const lackeyNames = ["Ethereal Lackey", "Faceless Lackey", "Goblin Lackey", "Kobold Lackey", "Witchy Lackey"];

        const lackeyName = game.lodash.sample(lackeyNames);
        if (!lackeyName) return;

        const lackey = new game.Card(lackeyName, plr);

        plr.addToHand(lackey);
    },

    invoke(plr, self) {
        game.functions.galakrondInvokeBump(self, "invokeCount");
    },

    placeholders(plr, self) {
        const amount = game.functions.galakrondFormula(self.storage.invokeCount)
        const multiple = amount > 1;

        const plural = multiple ? "s" : "";
        const plural2 = multiple ? "They" : "It";

        return {amount, plural, plural2};
    }
}
