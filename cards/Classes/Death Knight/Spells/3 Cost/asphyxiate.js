// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Asphyxiate",
    desc: "Destroy the highest Attack enemy minion.",
    mana: 3,
    type: "Spell",
    class: "Death Knight",
    rarity: "Common",
    set: "Path of Arthas",
    runes: "BB",
    spellClass: "Shadow",
    id: 250,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let board = game.board[plr.getOpponent().id];
        if (board.length <= 0) return;

        let highest_attack = board[0];

        board.forEach(m => {
            if (m.getAttack() <= highest_attack.getAttack()) return;

            highest_attack = m;
        });

        highest_attack.kill();
    }
}
