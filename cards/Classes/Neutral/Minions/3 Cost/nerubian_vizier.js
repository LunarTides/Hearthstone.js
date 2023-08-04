// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Nerubian Vizier",
    stats: [2, 4],
    desc: "Battlecry: Discover a spell. If a friendly Undead died after your last turn, it costs (2) less.",
    mana: 3,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Common",
    set: "March of the Lich King",
    id: 188,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let list = game.functions.getCards();
        list = list.filter(c => c.type == "Spell");
        if (list.length == 0) return;

        let card = game.interact.discover("Discover a spell.", list);
        if (!card) return -1;

        let valid = game.turns - 1;

        game.graveyard[plr.id].forEach(m => {
            if (valid >= m.turnKilled || !game.functions.matchTribe(m.tribe, "Undead")) return;

            //card.mana -= 2;
            card.addEnchantment("-2 mana", self);
        });

        plr.addToHand(card);
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    condition(plr, game, card) {
        let valid = false;
        
        game.graveyard[plr.id].forEach(m => {
            if (valid >= m.turnKilled || !game.functions.matchTribe(m.tribe, "Undead")) return;

            valid = true;
        });

        return valid;
    }
}
