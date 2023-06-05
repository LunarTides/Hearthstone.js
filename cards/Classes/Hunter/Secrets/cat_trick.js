// Created by the Custom Card Creator

/**
 * @type {import("../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Cat Trick",
    desc: "Secret: After your opponent casts a spell, summon a 4/2 Panther with Stealth.",
    mana: 2,
    type: "Spell",
    class: "Hunter",
    rarity: "Rare",
    set: "One Night in Karazhan",
    id: 218,

    /**
     * @type {import("../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        game.functions.addQuest("Secret", plr, self, "PlayCard", 1, (card, turn, done) => {
            if (card.type != "Spell") return false;
            if (!done) return;

            let panther = new game.Card("Cat Trick Panther", plr);
            game.summonMinion(panther, plr);
        });
    }
}
