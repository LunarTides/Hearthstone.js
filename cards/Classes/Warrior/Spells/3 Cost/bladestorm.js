// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Bladestorm",
    desc: "Deal 1 damage to all minions. Repeat until one dies.",
    mana: 3,
    type: "Spell",
    class: "Warrior",
    rarity: "Epic",
    set: "Ashes of Outland",
    id: 112,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let hasDied = false;
        let failsafe = 0;

        do {
            game.board.forEach(p => {
                p.forEach(m => {
                    game.attack(1, m);
                    if (m.getHealth() <= 0) hasDied = true;
                });
            });
            failsafe++;
        } while (!hasDied && (game.board[0].length || game.board[1].length) && failsafe < 200);
    }
}
