// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Shield Shatter",
    desc: "Deal 5 damage to all minions. Costs (1) less for each Armor you have.",
    mana: 10,
    type: "Spell",
    class: "Warrior",
    rarity: "Rare",
    set: "Fractured in Alterac Valley",
    spellClass: "Frost",
    id: 134,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, trigger) {
        //self.mana = self.backups.mana - plr.armor;
        //if (self.mana < 0) self.mana = 0;
        if (self.storage.length > 0) {
            self.removeEnchantment(`-${self.storage[0]} mana`, self);
            self.storage = [];
        }

        self.storage.push(plr.armor);
        self.addEnchantment(`-${plr.armor} mana`, self);
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                game.attack(5, m);
            });
        });
    }
}
