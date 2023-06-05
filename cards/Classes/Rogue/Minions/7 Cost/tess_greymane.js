// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Tess Greymane",
    stats: [6, 6],
    desc: "&BBattlecry:&R Replay every card from another class you've played this game.",
    mana: 7,
    type: "Minion",
    tribe: "None",
    class: "Rogue",
    rarity: "Legendary",
    set: "The Witchwood",
    id: 286,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        if (!game.events.PlayCard) return;

        let cardsPlayed = game.events.PlayCard[plr.id].map(c => c[0]);
        cardsPlayed = cardsPlayed.filter(c => !game.functions.validateClass(plr, c) && c.id != self.id);
        if (cardsPlayed.length <= 0) return;

        let isAi = plr.ai;
        if (!isAi) plr.ai = new game.AI(plr); // Have the ai choose the targets

        cardsPlayed = game.functions.shuffle(cardsPlayed);
        cardsPlayed.forEach(c => {
            let card = new game.Card(c.name, plr);

            card.costType = "none";

            game.playCard(card, plr);
        });

        if (!isAi) plr.ai = null;
    }
}
