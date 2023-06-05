// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Spreading Plague",
    desc: "Summon a 1/5 Scarab with Taunt. If your opponent has more minions, cast this again.",
    mana: 6,
    type: "Spell",
    class: "Druid",
    rarity: "Rare",
    set: "Knights of the Frozen Throne",
    spellClass: "Nature",
    id: 159,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let minion = new game.Card("Spreading Plague Beetle", plr);

        game.summonMinion(minion, plr);
        
        if (game.board[plr.getOpponent().id].length > game.board[plr.id].length) self.activate("cast");
    }
}
