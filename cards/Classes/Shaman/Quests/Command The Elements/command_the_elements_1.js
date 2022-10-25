module.exports = {
    name: "Command The Elements",
    desc: "Questline: Play 3 cards with Overload. Reward: Unlock your Overloaded Mana Crystals.",
    mana: 1,
    class: "Shaman",
    rarity: "Legendary",
    set: "United in Stormwind",

    cast(plr, game, card) {
        game.functions.addQuestline(plr, card, "cardsPlayed", 1, (val, game, turn, normal_done) => {
            if (val.plr == plr && val.desc.includes("Overload: ")) {
                if (card.storage.length >= 2) {
                    plr.overload = 0;
                    return true;
                }

                game.functions.progressQuest(card.displayName, 1);
                card.storage.push(val);
                return false;
            }
        }, "Questline Test Part 2", 3, true);
    }
}