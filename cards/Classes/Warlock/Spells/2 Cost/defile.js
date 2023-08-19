// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Defile",
    desc: "Deal $1 damage to all minions. If any die, cast this again.",
    mana: 2,
    type: "Spell",
    class: "Warlock",
    rarity: "Rare",
    set: "Knights of the Frozen Throne",
    spellClass: "Shadow",
    id: 294,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let died = false;

        game.board.forEach(p => {
            p.forEach(m => {
                game.attack("$1", m);

                if (m.getHealth() <= 0) died = true;
            });
        });

        if (died) self.activate("cast");
    }
}
