// Created by the Custom Card Creator

/**
 * @type {import("../../src/types").Blueprint}
 */
module.exports = {
    name: "Shaman Starting Hero",
    displayName: "Thrall",
    desc: "Shaman starting hero",
    mana: 0,
    type: "Hero",
    class: "Shaman",
    rarity: "Free",
    set: "Core",
    hpDesc: "Summon a random Totem.",
    uncollectible: true,

    /**
     * @type {import("../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        const totem_cards = ["Healing Totem", "Searing Totem", "Stoneclaw Totem", "Strength Totem"];
        let _totem_cards = [];

        totem_cards.forEach(c => {
            if (game.board[plr.id].map(m => m.name).includes(c)) return

            _totem_cards.push(new game.Card(c, plr));
        });

        if (_totem_cards.length == 0) return -1;

        const card = game.functions.randList(_totem_cards, false);

        game.summonMinion(card, plr);
    }
}
