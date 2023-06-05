// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Raid Boss Onyxia",
    stats: [8, 8],
    desc: "Rush. Immune while you control a Whelp. Battlecry: Summon six 2/1 Whelps with Rush.",
    mana: 10,
    type: "Minion",
    tribe: "Dragon",
    class: "Neutral",
    rarity: "Legendary",
    set: "Onyxia's Lair",
    keywords: ["Rush"],
    id: 163,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (game.board[plr.id].filter(m => m.name == "Onyxian Whelp").length) self.immune = true;
        else self.immune = false;
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let amount = 6 - game.board[plr.id].length;

        for (let i = 0; i < amount; i++) {
            let minion = new game.Card("Onyxian Whelp", plr);

            game.summonMinion(minion, plr);
        }
    }
}
