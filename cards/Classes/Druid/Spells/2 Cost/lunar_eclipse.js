// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Lunar Eclipse",
    desc: "Deal 3 damage to a minion. Your next spell this turn costs (2) less.",
    mana: 2,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "Madness at the Darkmoon Faire",
    spellClass: "Arcane",
    id: 139,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        // Deal 3 damage to a minion.
        let minion = game.interact.selectTarget("Deal 3 damage to a minion.", true, null, "minion");
        if (!minion) return -1;

        game.functions.spellDmg(minion, 3);
        
        // Your next spell this turn costs 2 less.
        let cards = [];

        let remove = game.functions.addEventListener("", true, () => {
            plr.hand.filter(c => c.type == "Spell").forEach(c => {
                if (!c.enchantmentExists("-2 mana", self)) c.addEnchantment("-2 mana", self);
            });
        }, -1);

        // Remove reduction when card played
        let removeCardsPlayed = game.functions.addEventListener("PlayCard", (val) => {
            return val != self && val.type == "Spell";
        }, () => {
            plr.hand.filter(c => c.type == "Spell").forEach(c => {
                c.removeEnchantment("-2 mana", self);
            });

            remove();
        }, 1);
        

        // Remove reduction when turn ends
        game.functions.addEventListener("EndTurn", (val) => {
            return game.player == plr;
        }, () => {
            plr.hand.filter(c => c.type == "Spell").forEach(c => {
                c.removeEnchantment("-2 mana", self);
            });

            remove();
            removeCardsPlayed();
        }, 1);
    }
}
