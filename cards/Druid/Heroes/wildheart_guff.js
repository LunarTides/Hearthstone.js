module.exports = {
    name: "Wildheart Guff",
    desc: "Battlecry: Set your maximum Mana to 20. Gain an empty Mana Crystal. Draw a card.",
    mana: 5,
    class: "Druid",
    rarity: "Legendary",
    set: "Fractured in Alterac Valley",

    battlecry(plr, game, card) {
        plr.setMaxMaxMana(20);
        plr.gainEmptyMana(1);
        plr.drawCard();
    },

    heropower(plr, game, card) {
        var choice = game.functions.chooseOne('Draw a card; or Gain an empty Mana Crystal.', ['Draw', 'Mana']);
        
        if (choice == 0) {            
            plr.drawCard();
        } else {
            plr.gainEmptyMana(1);
        }
    }
}