// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Flare",
    desc: "All minions lose Stealth. Destroy all enemy Secrets. Draw a card.",
    mana: 1,
    type: "Spell",
    class: "Hunter",
    rarity: "Rare",
    set: "Legacy",
    id: 214,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                m.removeKeyword("Stealth");
            });
        });

        plr.getOpponent().secrets = [];

        plr.drawCard();
    }
}
