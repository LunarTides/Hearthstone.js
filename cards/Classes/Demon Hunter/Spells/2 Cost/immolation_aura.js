// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Immolation Aura",
    desc: "Deal $1 damage to all minions twice.",
    mana: 2,
    type: "Spell",
    class: "Demon Hunter",
    rarity: "Common",
    set: "Ashes of Outland",
    spellClass: "Fel",
    id: 201,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        const doDamage = () => {
            game.board.forEach(p => {
                p.forEach(m => {
                    game.attack("$1", m);
                });
            });
        }

        doDamage();
        doDamage();
    }
}
