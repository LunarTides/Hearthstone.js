// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Astalor Flamebringer",
    displayName: "Astalor, the Flamebringer",
    stats: [8, 8],
    desc: "Battlecry: Deal 7 damage randomly split between all enemies. Manathirst (10): Deal 14 instead.",
    mana: 8,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "March of the Lich King",
    uncollectible: true,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let manathirst = self.manathirst(10);

        let amount = manathirst ? 14 : 7;

        for (let i = 0; i < amount; i++) {
            let opBoard = game.board[plr.getOpponent().id];

            let rand = game.functions.randInt(0, opBoard.length);
            if (rand == opBoard.length) {
                // Deal damage to the enemy hero
                game.attack(1, plr.getOpponent());
                continue;
            }

            let m = opBoard[rand];

            game.attack(1, m);
        }
    }
}
