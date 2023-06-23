// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Wildheart Guff",
    desc: "Battlecry: Set your maximum Mana to 20. Gain an empty Mana Crystal. Draw a card.",
    mana: 5,
    type: "Hero",
    class: "Druid",
    rarity: "Legendary",
    set: "Fractured in Alterac Valley",
    hpDesc: "Choose One - Draw a card; or Gain an empty Mana Crystal.",
    id: 3,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, card) {
        plr.maxMaxMana = 20;
        
        plr.gainEmptyMana(1);
        plr.drawCard();
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    heropower(plr, game, card) {
        let choice = game.interact.chooseOne('Draw a card; or Gain an empty Mana Crystal.', ['Draw', 'Mana']);
        
        if (choice == 0) {            
            plr.drawCard();
        } else {
            plr.gainEmptyMana(1);
        }
    }
}