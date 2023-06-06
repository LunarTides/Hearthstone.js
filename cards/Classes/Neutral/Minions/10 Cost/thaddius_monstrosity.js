// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Thaddius Monstrosity",
    displayName: "Thaddius, Monstrosity",
    stats: [11, 11],
    desc: "&BTaunt.&R Your odd-Cost cards cost (1). (Swaps polarity each turn!)",
    mana: 10,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Legendary",
    set: "Return to Naxxramas",
    keywords: ["Taunt"],
    id: 252,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        self.activate("passive", "StartTurn", "fake"); // Fun and goofy code with no future consequence whatsoever! :)
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "StartTurn" || (game.player == plr && val != "fake")) return;

        if (self.storage.length <= 0) self.storage = {"polarity": 1, "cards": []}; // 0 = Even, 1 = Odd. I do it this way in order to use the modulo operation
        else {
            self.storage.polarity = (self.storage.polarity == 0) ? 1 : 0;

            self.storage.cards.forEach(c => {
                c.removeEnchantment("mana = 1", self);
            });
            self.storage.cards = [];
        }

        let hand = plr.hand.filter(c => c.mana % 2 == self.storage.polarity);

        hand.forEach(c => {
            //c.mana = 1;
            if (!c.enchantmentExists("mana = 1", self)) c.addEnchantment("mana = 1", self);
            self.storage.cards.push(c);
        });
    }
}
