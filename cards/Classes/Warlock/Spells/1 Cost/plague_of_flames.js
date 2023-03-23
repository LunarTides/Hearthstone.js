module.exports = {
    name: "Plague of Flames",
    desc: "Destroy all your minions. For each one, destroy a random enemy minion.",
    mana: 1,
    class: "Warlock",
    rarity: "Rare",
    set: "Saviors of Uldum",
    spellClass: "Fire",
    id: 290,

    cast(plr, game, self) {
        game.board[plr.id].forEach(m => {
            m.kill();

            let minion = game.functions.randList(game.board[plr.getOpponent().id], false);
            if (!minion) return;

            minion.kill();
        });
    }
}
