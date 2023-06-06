// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Gift of the Naaru",
    desc: "Restore 3 Health to all characters. If any are still damaged, draw a card.",
    mana: 1,
    type: "Spell",
    class: "Priest",
    rarity: "Epic",
    set: "Fractured in Alterac Valley",
    spellClass: "Holy",
    id: 169,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        const doLogic = (t) => {
            t.addHealth(3);

            let cond;

            if (t instanceof game.Player) cond = t.health < t.maxHealth;
            else cond = t.getHealth() < t.maxHealth;

            if (cond) plr.drawCard();
        };

        game.functions.doPlayerTargets(plr, doLogic);
        game.functions.doPlayerTargets(plr.getOpponent(), doLogic);
    }
}
