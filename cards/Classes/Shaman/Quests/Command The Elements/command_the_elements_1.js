module.exports = {
    name: "Command The Elements",
    desc: "Questline: Play 3 cards with Overload. Reward: Unlock your Overloaded Mana Crystals.",
    mana: 1,
    type: "Spell",
    class: "Shaman",
    rarity: "Legendary",
    set: "United in Stormwind",
    id: 74,

    cast(plr, game, card) {
        game.functions.addQuest("Quest", plr, card, "GainOverload", 3, (val, game, turn, normal_done) => {
            if (card.storage.length >= 2) {
                plr.overload = 0;
                return true;
            }

            game.functions.progressQuest(card.displayName, 1);
            card.storage.push(val);
            return false;
        }, "Stir the Stones", true);
    }
}
