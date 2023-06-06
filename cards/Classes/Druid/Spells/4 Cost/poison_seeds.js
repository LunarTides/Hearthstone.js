// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Poison Seeds",
    desc: "Destroy all minions and summon 2/2 Treants to replace them.",
    mana: 4,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "Naxxramas",
    spellClass: "Nature",
    id: 145,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                m.kill();

                let treant = new game.Card("Poison Seeds Treant", m.plr);
                game.summonMinion(treant, m.plr);
            });
        });
    }
}
