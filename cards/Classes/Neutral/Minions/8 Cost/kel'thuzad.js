// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Kel'Thuzad",
    stats: [6, 8],
    desc: "At the end of each turn, summon all friendly minions that died this turn.",
    mana: 8,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Legendary",
    set: "Naxxramas",
    id: 29,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "EndTurn") return;

        game.graveyard[plr.id].forEach(m => {
            if (m.plr == plr && m.turnKilled == game.turns) game.summonMinion(new game.Card(m.name, plr), plr);
        });
    }
}
