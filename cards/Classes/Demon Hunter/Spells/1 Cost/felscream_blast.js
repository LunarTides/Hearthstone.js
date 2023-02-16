module.exports = {
    name: "Felscream Blast",
    desc: "Lifesteal. Deal 1 damage to a minion and its neighbors.",
    mana: 1,
    class: "Demon Hunter",
    rarity: "Common",
    set: "Madness at the Darkmoon Faire",
    spellClass: "Fel",
    id: 198,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Lifesteal. Deal 1 damage to a minion and its neighbors.", true, null, "minion");
        if (!target) return -1

        const doDamage = (t) => {
            game.functions.spellDmg(t, 1);
            plr.addHealth(1 + plr.spellDamage);
        }

        let board = game.board[target.plr.id];
        let index = board.indexOf(target);
        if (index == -1) return -1;

        if (index > 0) doDamage(board[index - 1]);
        doDamage(target);
        if (index < board.length - 1) doDamage(board[index + 1]);
    }
}
