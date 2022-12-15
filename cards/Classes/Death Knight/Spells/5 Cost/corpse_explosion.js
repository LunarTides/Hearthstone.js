module.exports = {
    name: "Corpse Explosion",
    desc: "Detonate a Corpse to deal 1 damage to all minions. If any are still alive, repeat this.",
    mana: 5,
    class: "Death Knight",
    rarity: "Rare",
    set: "March of the Lich King",
    spellClass: "Shadow",
    runes: ["BB"],
            
    cast(plr, game, card) {
        do {
            plr.tradeCorpses(1, () => {
                game.board.forEach(b => {
                    b.forEach(c => {
                        game.attack(1, c);
                    });
                });
            });
        } while ((game.board[0].length || game.board[1].length) && plr.corpses > 0);
    }
}
