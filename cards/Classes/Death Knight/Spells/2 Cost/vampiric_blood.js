// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Vampiric Blood",
    desc: "Give your hero +5 Health. Spend 3 Corpses to gain 5 more and draw a card.",
    mana: 2,
    type: "Spell",
    class: "Death Knight",
    rarity: "Rare",
    set: "March of the Lich King",
    runes: "BBB",
    id: 186,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        const give5Health = (drawFlag = true) => {
            plr.addHealth(5);

            if (drawFlag) plr.drawCard();
        }

        give5Health(false);
        plr.tradeCorpses(3, give5Health);
    }
}
