// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Galakrond the Nightmare",
    displayName: "Galakrond, the Nightmare",
    desc: "&BBattlecry:&R Draw {amount} card{plural}. {plural2} costs (0).",
    mana: 7,
    type: "Hero",
    class: "Rogue",
    rarity: "Legendary",
    hpDesc: "Add a &BLackey&R to your hand.",
    hpCost: 2,
    id: 321,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        /*
         * 'x' is the amount of times invoked:
         * 'y' is the amount of cards to draw:
         *
         * 'x'->formula->'y'
         * 0->formula->1
         * 1->formula->1
         * 2->formula->2
         * 3->formula->2
         * 4->formula->4
         * 5->formula->4
         */
        const x = self.invoke_count;
        const y = Math.ceil((x + 1) / 2) + Math.round(x * 0.15);

        const amount = y || 1;

        for (let i = 0; i < amount; i++) {
            const card = plr.drawCard();
            if (!card) return;

            card.addEnchantment("mana = 0", self);
        }
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        const lackey_cards = ["Ethereal Lackey", "Faceless Lackey", "Goblin Lackey", "Kobold Lackey", "Witchy Lackey"];

        let lackey = game.functions.randList(lackey_cards);
        lackey = new game.Card(lackey, plr);

        plr.addToHand(lackey);
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

        let plural = multiple ? "s" : "";
        let plural2 = multiple ? "They" : "It";

        return {"amount": amount, "plural": plural, "plural2": plural2};
    }
}
