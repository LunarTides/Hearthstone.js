module.exports = {
    name: "Celestial Alignment",
    desc: "Set your Mana Crystals to 0. Set the Cost of cards in your hand and deck to (1).",
    mana: 8,
    type: "Spell",
    class: "Druid",
    rarity: "Epic",
    set: "Forged in the Barrens",
    spellClass: "Arcane",
    id: 26,

    cast(plr, game, self) {
        plr.maxMana = 0;
        plr.mana = 0;

        plr.hand.forEach(c => {
            c.addEnchantment("mana = 1", self);
            //c.mana = 1;
            //c.backups.mana = 1;
        });

        plr.deck.forEach(c => {
            c.addEnchantment("mana = 1", self);
            //c.mana = 1;
            //c.backups.mana = 1;
        });
    }
}
