module.exports = {
    name: "Crystal Power",
    desc: "Choose One - Deal 2 damage to a minion; or Restore 5 Health.",
    mana: 1,
    class: "Druid",
    rarity: "Common",
    set: "Rise of Shadows",

    cast(plr, game, card) {
        var choice = game.functions.chooseOne('Deal 2 damage to a minion; or Restore 5 Health.', ['2 Damage', '5 Health']);
        
        if (choice == 0) {
            var target = game.functions.selectTarget("Deal 2 damage to a minion.", true, null, "minion");
            if (!target) return -1;
            
            game.functions.spellDmg(target, 2);
        } else {
            var target = game.functions.selectTarget("Restore 5 health.", true);
            if (!target) return -1;
            
            target.addHealth(5, true);
        }
    }
}