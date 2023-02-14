module.exports = {
    name: "The Sunwell",
    desc: "Fill your hand with random spells. Costs (1) less for each other card in your hand.",
    mana: 9,
    class: "Neutral",
    rarity: "Legendary",
    set: "March of the Lich King",
    spellClass: "Holy",
    id: 181,

    passive(plr, game, self, key, val) {
        let discount = (plr.hand.length - 1);
        if (discount < 0) discount = 0;

        self.mana = self.backups.mana - discount;
        if (self.mana < 0) self.mana = 0;
    },

    cast(plr, game, self) {
        let list = Object.values(game.functions.getCards()).filter(c => game.functions.getType(c) == "Spell");
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
