module.exports = {
    name: "Freezing Trap",
    desc: "Secret: When an enemy minion attacks, return it to its owner's hand, it costs (2) more.",
    mana: 2,
    class: "Hunter",
    rarity: "Common",
    set: "Core",
    spellClass: "Frost",
    id: 31,

    cast(plr, game, card) {
        game.functions.addQuest("Secret", plr, card, "minionsThatAttacked", 1, (minion, game, turn) => {
            let m = new game.Card(minion[0].name, game.player);
            //m.mana += 2;
            m.addEnchantment("+2 mana", card);
            m.plr.addToHand(m, false);

            minion[0].destroy();

            return true;
        }, null);
    }
}