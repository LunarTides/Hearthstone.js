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
        game.functions.addQuest("Quest", plr, card, "GainOverload", 3, (val, turn, done) => {
            if (!done) return;

            // The quest is done
            plr.overload = 0;
        }, "Stir the Stones");
    }
}
