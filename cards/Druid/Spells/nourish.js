module.exports = {
    name: "Nourish",
    desc: "Choose One - Gain 2 Mana Crystals; or Draw 3 cards.",
    mana: 5,
    class: "Druid",
    rarity: "Rare",
    set: "Core",
    spellClass: "Nature",

    cast(plr, game, card) {
        var choice = game.functions.chooseOne('Gain 2 Mana Crystals; or Draw 3 cards.', ['+2 Mana Crystals', '+3 Cards']);
        
        if (choice == 0) {
            plr.gainMana(2);
        } else {
            for (let i = 0; i < 3; i++) {
                plr.drawCard();
            }
        }
    }
}