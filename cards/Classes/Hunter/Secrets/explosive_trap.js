// Created by the Custom Card Creator

/**
 * @type {import("../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Explosive Trap",
    desc: "Secret: When your hero is attacked, deal $2 damage to all enemies.",
    mana: 2,
    type: "Spell",
    class: "Hunter",
    rarity: "Common",
    set: "Core",
    spellClass: "Fire",
    id: 30,

    /**
     * @type {import("../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        game.functions.addQuest("Secret", plr, card, "Attack", 1, (attack, turn, done) => {
            let [attacker, target] = attack;
            if (target != plr) return false;
            if (!done) return;

            game.functions.doPlayerTargets(plr.getOpponent(), t => {
                game.attack("$2", t);
            });
        });
    }
}
