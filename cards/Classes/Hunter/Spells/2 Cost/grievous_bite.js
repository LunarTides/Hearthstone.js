module.exports = {
    name: "Grievous Bite",
    desc: "Deal 2 damage to a minion and 1 damage to adjacent ones.",
    mana: 2,
    class: "Hunter",
    rarity: "Common",
    set: "Journey to Un'Goro",
    id: 224,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Deal 2 damage to a minion and 1 damage to adjacent ones.", true, null, "minion");
        if (!target) return -1;

        let board = game.board[target.plr.id];
        let index = board.indexOf(target);
        if (index == -1) return -1;

        const doAttack = (target, dmg) => {
            game.functions.spellDmg(target, dmg);
        }

        if (index > 0) doAttack(board[index - 1], 1);
        doAttack(target, 2);
        if (index < board.length - 1) doAttack(board[index + 1], 1);
    }
}
