module.exports = {
    name: "Spammy Arcanist",
    stats: [3, 4],
    desc: "Battlecry: Deal 1 damage to all other minions. If any die, repeat this.",
    mana: 5,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Epic",
    set: "Fractured in Alterac Valley",
    id: 142,

    battlecry(plr, game, self) {
        let hasDied = false;
        
        do {
            hasDied = false;

            game.board.forEach(p => {
                p.forEach(m => {
                    if (m == self) return;

                    game.attack(1, m);
                    if (m.getHealth() <= 0) hasDied = true;
                });
            });
        } while (hasDied);
    }
}
