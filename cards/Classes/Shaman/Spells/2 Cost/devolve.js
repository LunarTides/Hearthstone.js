// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Devolve",
    desc: "Transform all enemy minions into random ones that cost (1) less.",
    mana: 2,
    type: "Spell",
    class: "Shaman",
    rarity: "Rare",
    spellClass: "Nature",
    id: 304,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        game.board[plr.getOpponent().id].forEach(m => {
            let list = game.functions.getCards();
            list = list.filter(c => c.type == "Minion" && c.mana == m.mana - 1);

            let minion = game.functions.randList(list);
            if (!minion) return;
            minion = new game.Card(minion.name, plr);

            m.destroy();
            game.summonMinion(minion, plr.getOpponent());
        });
    }
}
