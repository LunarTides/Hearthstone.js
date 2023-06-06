// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Nazmani Bloodweaver",
    stats: [2, 5],
    desc: "After you cast a spell, reduce the cost of a random card in your hand by (1).",
    mana: 3,
    type: "Minion",
    tribe: "None",
    class: "Priest",
    rarity: "Rare",
    set: "Madness at the Darkmoon Faire",
    id: 65,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, card, key, val) {
        if (key != "PlayCard" || val.type != "Spell" || game.player != plr) return;
        if (plr.hand.filter(c => c.mana > 0).length <= 0) return;
        
        let randomCard;

        do randomCard = game.functions.randList(plr.hand, false);
        while (randomCard.mana <= 0);

        //randomCard.mana -= 1;
        randomCard.addEnchantment("-1 mana", card);
    }
}
