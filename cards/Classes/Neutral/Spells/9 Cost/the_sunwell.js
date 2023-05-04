module.exports = {
    name: "The Sunwell",
    desc: "Fill your hand with random spells. Costs (1) less for each other card in your hand.",
    mana: 9,
    type: "Spell",
    class: "Neutral",
    rarity: "Legendary",
    set: "March of the Lich King",
    spellClass: "Holy",
    id: 181,

    passive(plr, game, self, key, val) {
        let discount = (plr.hand.length - 1);
        if (discount < 0) discount = 0;

        //self.mana = self.backups.mana - discount;
        if (self.storage.length > 0) {
            self.removeEnchantment(`-${self.storage[0]} mana`, self);
            self.storage = [];
        }

        self.storage.push(discount);
        if (!self.enchantmentExists(`-${discount} mana`, self)) self.addEnchantment(`-${discount} mana`, self);
    },

    cast(plr, game, self) {
        let list = game.functions.getCards().filter(c => c.type == "Spell");
        if (list.length == 0) return;

        // I do this approach to support changing max hand space later on
        let handLen = plr.hand.length;
        do {
            let spell = game.functions.randList(list);
            spell = new game.Card(spell.name, plr);

            plr.addToHand(spell);
            handLen++;
        } while (handLen == plr.hand.length);
    }
}
