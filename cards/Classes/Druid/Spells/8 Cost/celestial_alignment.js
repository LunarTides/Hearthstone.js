module.exports = {
    name: "Celestial Alignment",
    desc: "Set your Mana Crystals to 0. Set the Cost of cards in your hand and deck to (1).",
    mana: 8,
    class: "Druid",
    rarity: "Epic",
    set: "Forged in the Barrens",
    spellClass: "Arcane",

    cast(plr, game, card) {
        plr.setMaxMana(0);
        plr.setMana(0);

        plr.hand.forEach(c => {
            c.setMana(1);
            c._mana = 1;
        });

        plr.deck.forEach(c => {
            c.setMana(1);
            c._mana = 1;
        });
    }
}