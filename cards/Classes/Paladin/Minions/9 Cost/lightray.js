// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Lightray",
    stats: [5, 5],
    desc: "&BTaunt.&R Costs (1) less for each Paladin card you've played this game.",
    mana: 9,
    type: "Minion",
    tribe: "Elemental / Beast",
    class: "Paladin",
    rarity: "Common",
    set: "Throne of the Tides",
    keywords: ["Taunt"],
    id: 270,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    handpassive(plr, game, self, key, val) {
        if (!game.events.PlayCard) return; // Noone has played any cards yet.
        let cards_played = game.events.PlayCard[plr.id].map(c => c[0]).filter(c => c.class.includes("Paladin")).length;

        //self.mana = self.backups.mana - cards_played;
        //if (self.mana < 0) self.mana = 0;
        if (self.storage.length > 0) {
            self.removeEnchantment(`-${self.storage[0]} mana`, self);
            self.storage = [];
        }

        self.storage.push(cards_played);
        self.addEnchantment(`-${cards_played} mana`, self);
    }
}
