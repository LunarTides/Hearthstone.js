module.exports = {
    name: "Explosive Sheep",
    stats: [1, 1],
    desc: "&BDeathrattle:&R Deal 2 damage to all minions.",
    mana: 2,
    tribe: "Mech / Beast",
    class: "Neutral",
    rarity: "Common",
    set: "Goblins vs Gnomes",
    id: 295,

    deathrattle(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                m.remHealth(2);
            });
        });
    }
}
