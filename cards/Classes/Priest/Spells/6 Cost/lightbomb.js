module.exports = {
    name: "Lightbomb",
    desc: "Deal damage to each minion equal to its Attack.",
    mana: 6,
    class: "Priest",
    rarity: "Epic",
    set: "Goblins vs Gnomes",
    spellClass: "Holy",
    id: 223,

    cast(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                game.attack(m.getAttack(), m);
            });
        });
    }
}
