// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Crystal Power",
    desc: "Choose One - Deal 2 damage to a minion; or Restore 5 Health.",
    mana: 1,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "Rise of Shadows",
    id: 17,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let choice = game.interact.chooseOne('Deal 2 damage to a minion; or Restore 5 Health.', ['2 Damage', '5 Health']);
        
        if (choice == 0) {
            let target = game.interact.selectTarget("Deal 2 damage to a minion.", self, null, "minion");
            if (!target) return -1;
            
            game.functions.spellDmg(target, 2);
        } else {
            var target = game.interact.selectTarget("Restore 5 health.", self);
            if (!target) return -1;
            
            target.addHealth(5, true);
        }
    }
}
