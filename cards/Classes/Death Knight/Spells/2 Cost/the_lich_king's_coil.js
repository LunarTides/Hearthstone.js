// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "The Lich King's Coil",
    displayName: "Death Coil",
    desc: "Deal 5 damage to an enemy, or restore 5 Health to a friendly character.",
    mana: 2,
    type: "Spell",
    class: "Death Knight",
    rarity: "Free",
    set: "Knights of the Frozen Throne",
    spellClass: "Shadow",
    uncollectible: true,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget("Deal 5 damage to an enemy, or restore 5 Health to a friendly character.", true);
        if (!target) return -1;

        if (target instanceof game.Card) {
            if (target.plr == plr) target.addHealth(5);
            else game.attack(5, target);

            return;
        }

        if (target == plr) target.addHealth(5);
        else game.attack(5, target);
    }
}
