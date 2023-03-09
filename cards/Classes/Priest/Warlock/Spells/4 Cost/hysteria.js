module.exports = {
    name: "Hysteria",
    desc: "Choose an enemy minion. It attacks random minions until it dies.",
    mana: 4,
    class: "Priest / Warlock",
    rarity: "Rare",
    set: "Darkmoon Races",
    spellClass: "Shadow",
    id: 246,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Choose an enemy minion. It attacks random minions until it dies.", true, "enemy", "minion");
        if (!target) return -1;

        const doAttack = () => {
            let side = game.functions.randInt(0, 1);
            let board = game.board[side];

            let rng = game.functions.randInt(0, board.length - 1);

            let chosen_board = game.board[side];
            let minion = board[rng];
            if (!minion) return;

            if (minion == target || minion.getHealth() <= 0) return;

            target.sleepy = false;
            target.resetAttackTimes();

            game.attack(target, minion);
        }

        do {
            doAttack();
        } while (target.getHealth() > 0 && (game.board[target.plr.id].length > 1 || game.board[target.plr.getOpponent().id].length > 0));
    }
}
