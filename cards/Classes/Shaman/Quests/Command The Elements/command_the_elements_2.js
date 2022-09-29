module.exports = {
    name: "Stir the Stones",
    desc: "Questline: Play 3 cards with Overload. Reward: Summon a 3/3 Elemental with Taunt.",
    mana: 0,
    class: "Shaman",
    rarity: "Legendary",
    set: "United in Stormwind",
    uncollectible: true,

    cast(plr, game, card) {
        game.functions.addQuestline(plr, card, "cardsPlayed", 1, (val, game, turn, normal_done) => {
            if (val.plr == plr && val.desc.includes("Overload: ")) {
                if (card.storage.length >= 2) {
                    game.playMinion(new game.Card("Living Earth", plr), plr);
                    return true;
                }

                game.functions.progressQuest(card.displayName, 1);
                card.storage.push(val);
                return false;
            }
        }, "Questline Test Part 3", 3, true);
    }
}