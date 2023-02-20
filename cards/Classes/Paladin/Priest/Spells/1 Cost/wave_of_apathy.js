module.exports = {
    name: "Wave of Apathy",
    desc: "Set the Attack of all enemy minions to 1 until your next turn.",
    mana: 1,
    class: "Paladin / Priest",
    rarity: "Common",
    set: "Scholomance Academy",
    id: 174,

    cast(plr, game, self) {
        game.board[plr.getOpponent().id].forEach(m => {
            self.storage.push([m, m.getAttack()]);
            m.stats[0] = 1;
        });

        game.functions.addPassive("turnStarts", (key, val) => {
            return game.player != plr;
        },
        () => {
            self.storage.forEach(v => {
                v[0].stats[0] += v[1] - 1;
            });
        }, 1);
    }
}
