module.exports = {
    name: "Shadow Word Devour",
    displayName: "Shadow Word: Devour",
    desc: "Choose a minion. It steals 1 Health from ALL other minions.",
    mana: 1,
    class: "Priest",
    rarity: "Epic",
    set: "Fractured in Alterac Valley",
    spellClass: "Shadow",
    id: 172,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Choose a minion. It steals 1 Health from ALL other minions.", true, null, "minion");
        if (!target) return -1;

        game.board.forEach(p => {
            p.forEach(m => {
                game.attack(1, m);
                target.addStats(0, 1);
            });
        });
    }
}