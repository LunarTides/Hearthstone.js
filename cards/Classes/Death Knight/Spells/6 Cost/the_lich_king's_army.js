// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "The Lich King's Army",
    displayName: "Army of the Dead",
    desc: "Remove the top 5 cards of your deck. Summon any minions removed.",
    mana: 6,
    type: "Spell",
    class: "Death Knight",
    rarity: "Free",
    set: "Knights of the Frozen Throne",
    spellClass: "Shadow",
    uncollectible: true,
    id: 124,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let cards = plr.deck.splice(plr.deck.length - 5, 5);

        cards.forEach(c => {
            if (c.type != "Minion") return;

            game.summonMinion(c, plr);
        });
    }
}
