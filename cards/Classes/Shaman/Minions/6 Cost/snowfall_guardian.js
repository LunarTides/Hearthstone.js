module.exports = {
    name: "Snowfall Guardian",
    stats: [5, 5],
    desc: "&Battlecry: Freeze&R all other minions.",
    mana: 6,
    tribe: "Elemental",
    class: "Shaman",
    rarity: "Common",
    id: 309,

    battlecry(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                m.frozen = true;
            });
        });
    }
}
