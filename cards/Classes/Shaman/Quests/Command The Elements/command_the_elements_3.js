module.exports = {
    name: "Tame the Flames",
    desc: "Questline: Play 3 cards with Overload. Reward: Stormcaller Bru'kan.",
    mana: 0,
    class: "Shaman",
    rarity: "Legendary",
    set: "United in Stormwind",
    uncollectible: true,

    cast(plr, game, card) {
        game.functions.addQuestline(plr, card, "cardsPlayed", 1, (val, game, turn, normal_done) => {
            if (val.plr == plr && val.desc.includes("Overload: ")) {
                if (card.storage.length >= 2) {
                    game.functions.addToHand(new game.Card("Stormcaller Bru'kan", plr), plr);
                    return true;
                }

                game.functions.progressQuest(card.displayName, 1);
                card.storage.push(val);
                return false;
            }
        }, null, 3, true);
    }
}