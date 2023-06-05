// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Elwynn Boar",
    stats: [1, 1],
    // TODO: Remove this note when the bug is fixed.
    desc: "&B[THIS CARD IS CURRENTLY BROKEN] Deathrattle:&R If you had 7 Elwynn Boars die this game, equip a 15/3 Sword of a Thousand Truths.",
    mana: 1,
    type: "Minion",
    tribe: "Beast",
    class: "Neutral",
    rarity: "Epic",
    set: "United in Stormwind",
    id: 135,

    /**
     * TODO: Temp battlecry. Remove this when the bug is fixed.
     * 
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        if (plr.ai) return -1; // Ai's aren't allowed to play this.

        let confirm = game.interact.yesNoQuestion(plr, "NOTE: This card is currently broken. It might crash the game under some certain unknown conditions. Are you sure you want to play this card?".yellow);
        if (!confirm) return -1;
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        let stat = game.events.increment(plr, "elwynnBoarsKilled");
        if (stat <= 7) return;

        plr.setWeapon(new game.Card("Elwynn Boar Sword", plr));
    }
}
