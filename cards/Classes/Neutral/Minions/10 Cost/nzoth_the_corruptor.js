// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "NZoth the Corruptor",
    displayName: "N'Zoth, the Corruptor",
    stats: [5, 7],
    desc: "Battlecry: Summon your Deathrattle minions that died this game.",
    mana: 10,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Whispers of the Old Gods",
    id: 32,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let amount = game.board[plr.id].length + 1;

        game.graveyard[plr.id].forEach(m => {
            if (!m.deathrattle || false || amount >= 7) return;

            let minion = new game.Card(m.name, plr);
            game.summonMinion(minion, plr);

            amount++;
        });
    }
}
