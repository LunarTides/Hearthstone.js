// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Academic Espionage",
    desc: "Shuffle 10 cards from your opponent's class into your deck. They cost (1).",
    mana: 4,
    type: "Spell",
    class: "Rogue",
    rarity: "Epic",
    set: "The Boomsday Project",
    id: 282,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let list = game.functions.getCards();
        list = list.filter(c => c.class == plr.getOpponent().heroClass);
        if (list.length <= 0) return;
        
        const doShuffle = () => {
            let card = game.functions.randList(list);
            card = new game.Card(card.name, plr);

            //card.mana = 1;
            card.addEnchantment("mana = 1", self);

            plr.shuffleIntoDeck(card);
        }

        for (let i = 0; i < 10; i++) doShuffle();
    }
}
