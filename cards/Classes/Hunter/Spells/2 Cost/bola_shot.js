module.exports = {
    name: "Bola Shot",
    desc: "Deal 1 damage to a minion and 2 damage to its neighbors.",
    mana: 2,
    class: "Hunter",
    rarity: "Common",
    set: "Darkmoon Races",
    id: 217,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Deal 1 damage to a minion and 2 damage to its neighbors.", true, null, "minion");
        if (!target) return -1;

        let board = game.board[target.plr.id];
        let index = board.indexOf(target);
        if (index == -1) return -1;

        const doAttack = (target, dmg) => {
            game.functions.spellDmg(target, dmg);
        }

        if (index > 0) doAttack(board[index - 1], 2);
        doAttack(target, 1);
        if (index < board.length - 1) doAttack(board[index + 1], 2);
    }
}