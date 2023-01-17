module.exports = {
    name: "Tame the Flames",
    desc: "Questline: Play 3 cards with Overload. Reward: Stormcaller Bru'kan.",
    mana: 0,
    class: "Shaman",
    rarity: "Legendary",
    set: "United in Stormwind",
    uncollectible: true,
    id: 76,

    cast(plr, game, card) {
        game.functions.addQuest("Quest", plr, card, "overloadGained", 3, (val, game, turn, normal_done) => {
            if (card.storage.length >= 2) {
                plr.addToHand(new game.Card("Stormcaller Bru'kan", plr));
                return true;
            }

            game.functions.progressQuest(card.displayName, 1);
            card.storage.push(val);
            return false;
        }, null, true);
    }
}