// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "The Lich King's Goal",
    displayName: "Death and Decay",
    desc: "Deal 3 damage to all enemies.",
    mana: 3,
    type: "Spell",
    class: "Death Knight",
    rarity: "Free",
    set: "Knights of the Frozen Throne",
    spellClass: "Shadow",
    uncollectible: true,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        game.board[plr.getOpponent().id].forEach(m => {
            game.attack(3, m);
        });

        game.attack(3, plr.getOpponent());
    }
}
