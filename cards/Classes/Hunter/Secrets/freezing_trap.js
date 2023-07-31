// Created by the Custom Card Creator

/**
 * @type {import("../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Freezing Trap",
    desc: "Secret: When an enemy minion attacks, return it to its owner's hand, it costs (2) more.",
    mana: 2,
    type: "Spell",
    class: "Hunter",
    rarity: "Common",
    set: "Core",
    spellClass: "Frost",
    id: 31,

    /**
     * @type {import("../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        game.functions.addQuest("Secret", plr, card, "Attack", 1, (attack, turn, done) => {
            let [attacker, target] = attack;
            if (!attacker instanceof game.Card) return false;
            if (!done) return;

            let m = new game.Card(attacker.name, plr.getOpponent());
            m.addEnchantment("+2 mana", card);

            game.suppressedEvents.push("AddCardToHand");
            plr.getOpponent().addToHand(m);
            game.suppressedEvents.pop();

            attacker.destroy();
        });
    }
}
