module.exports = {
    name: "Tamsin Roame",
    stats: [1, 3],
    desc: "Whenever you cast a Shadow spell that costs (1) or more, add a copy to your hand that costs (0).",
    mana: 3,
    tribe: "Undead",
    class: "Warlock",
    rarity: "Legendary",
    set: "Forged in the Barrens",
    id: 299,

    passive(plr, game, self, key, val) {
        if (key != "cardsPlayed" || val.type != "Spell" || val.mana <= 0 || !val.spellClass || !val.spellClass.includes("Shadow")) return;

        let copy = new game.Card(val.name, plr);
        //copy.mana = 0;
        copy.addEnchantment("mana = 0", self);
        plr.addToHand(copy);
    }
}
