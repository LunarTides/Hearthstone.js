// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Topple the Idol",
    desc: "Dredge. Deal damage to equal to its Cost to all minions.",
    mana: 5,
    type: "Spell",
    class: "Demon Hunter",
    rarity: "Rare",
    set: "Throne of the Tides",
    id: 210,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let card = game.interact.dredge();
        if (!card) return;

        game.board.forEach(p => {
            p.forEach(m => {
                game.functions.spellDmg(m, card.mana);
            });
        });
    }
}
