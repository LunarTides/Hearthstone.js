// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Grievous Bite",
    desc: "Deal $2 damage to a minion and $1 damage to adjacent ones.",
    mana: 2,
    type: "Spell",
    class: "Hunter",
    rarity: "Common",
    set: "Journey to Un'Goro",
    id: 224,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, self, null, "minion");
        if (!target) return -1;

        let board = game.board[target.plr.id];
        let index = board.indexOf(target);
        if (index == -1) return -1;

        const doAttack = (target, dmg) => {
            game.attack(`$${dmg}`, target);
        }

        if (index > 0) doAttack(board[index - 1], 1);
        doAttack(target, 2);
        if (index < board.length - 1) doAttack(board[index + 1], 1);
    }
}
