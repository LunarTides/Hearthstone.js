// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Invincible",
    stats: [5, 5],
    desc: "Reborn. Battlecry and Deathrattle: Give a random friendly Undead +5/+5 and Taunt.",
    mana: 8,
    type: "Minion",
    tribe: "Undead Beast",
    class: "Neutral",
    rarity: "Legendary",
    set: "March of the Lich King",
    keywords: ["Reborn"],
    id: 119,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let cards = game.board[plr.id].filter(m => m.type == "Minion" && game.functions.matchTribe(m.tribe, "Undead") && m != self);
        let card = game.functions.randList(cards, false);
        if (!card) return;

        card.addStats(5, 5);
        card.addKeyword("Taunt");
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    deathrattle(plr, game, self) {
        self.activateBattlecry();
    }
}
