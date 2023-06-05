// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Dun Baldar Bunker",
    desc: "At the end of your turn, draw a Secret and set its Cost to (1). Lasts 3 turns.",
    mana: 2,
    type: "Spell",
    class: "Hunter",
    rarity: "Rare",
    set: "Fractured in Alterac Valley",
    id: 220,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        game.functions.addEventListener("EndTurn", (key, val) => {
            return game.player == plr;
        },
        () => {
            let list = plr.deck.filter(c => c.type == "Spell" && c.desc.startsWith("Secret: "));
            if (!list) return;

            let card = game.functions.randList(list, false);
            if (!card) return;

            //card.mana = 1;
            card.addEnchantment("mana = 1", self);
            plr.drawSpecific(card);
        }, 3);
    }
}
