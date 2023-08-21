// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Provoke",
    desc: "Tradeable. Choose a friendly minion. Enemy minions attack it.",
    mana: 0,
    type: "Spell",
    class: "Warrior",
    rarity: "Epic",
    set: "United in Stormwind",
    keywords: ["Tradeable"],
    id: 107,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let minion = game.interact.selectTarget("Choose a friendly minion. Enemy minions attack it.", self, "friendly", "minion");
        if (!minion) return -1;

        game.board[plr.getOpponent().id].forEach(m => {
            if (minion.getHealth() <= 0) return;

            game.attack(m, minion);
        });
    }
}
