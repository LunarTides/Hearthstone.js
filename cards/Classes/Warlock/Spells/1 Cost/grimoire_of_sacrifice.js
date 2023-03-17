module.exports = {
    name: "Grimoire of Sacrifice",
    desc: "Destroy a friendly minion. Deal 2 damage to all enemy minions.",
    mana: 1,
    class: "Warlock",
    rarity: "Common",
    set: "Forged in the Barrens",
    spellClass: "Shadow",
    id: 288,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Destroy a friendly minion.", true, "friendly", "minion");
        if (!target) return -1;

        target.kill();

        game.board[plr.getOpponent().id].forEach(m => {
            game.attack(2, m);
        });
    }
}
