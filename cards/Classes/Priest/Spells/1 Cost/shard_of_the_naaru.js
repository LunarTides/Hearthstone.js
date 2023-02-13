module.exports = {
    name: "Shard of the Naaru",
    desc: "Tradeable. Silence all enemy minions.",
    mana: 1,
    class: "Priest",
    rarity: "Common",
    set: "United in Stormwind",
    keywords: ["Tradeable"],
    spellClass: "Holy",
    id: 173,

    cast(plr, game, self) {
        game.board[plr.getOpponent().id].forEach(m => {
            m.silence();
        });
    }
}
