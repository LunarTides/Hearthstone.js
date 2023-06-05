// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Barricade",
    desc: "Summon a 2/4 Guard with Taunt. If it's your only minion, summon another.",
    mana: 4,
    type: "Spell",
    class: "Warrior / Paladin",
    rarity: "Common",
    set: "Madness at the Darkmoon Faire",
    id: 114,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let minion = new game.Card("Race Guard", plr);
        
        game.summonMinion(minion, plr);
        if (game.board[plr.id].length == 1) game.summonMinion(game.functions.cloneCard(minion), plr);
    }
}
