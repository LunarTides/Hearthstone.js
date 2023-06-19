// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Corpse Explosion",
    desc: "Detonate a Corpse to deal 1 damage to all minions. If any are still alive, repeat this.",
    mana: 5,
    type: "Spell",
    class: "Death Knight",
    rarity: "Rare",
    set: "March of the Lich King",
    spellClass: "Shadow",
    runes: "BB",
    id: 14,
          
    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        let success;

        do {
            success = plr.tradeCorpses(1, () => {
                game.board.forEach(b => {
                    b.forEach(c => {
                        game.attack(1, c);
                    });
                });
            });

            if (!success) break; // If plr.tradeCorpses returns false, return from the while loop.
        } while (game.board[0].length || game.board[1].length);
    }
}
