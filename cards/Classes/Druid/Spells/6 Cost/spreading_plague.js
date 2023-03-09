module.exports = {
    name: "Spreading Plague",
    desc: "Summon a 1/5 Scarab with Taunt. If your opponent has more minions, cast this again.",
    mana: 6,
    class: "Druid",
    rarity: "Rare",
    set: "Knights of the Frozen Throne",
    spellClass: "Nature",
    id: 159,

    cast(plr, game, self) {
        let minion = new game.Card("Spreading Plague Beetle", plr);

        game.summonMinion(minion, plr);
        
        if (game.board[plr.getOpponent().id].length > game.board[plr.id].length) self.activate("cast");
    }
}