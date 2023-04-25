module.exports = {
    name: "Stir the Stones",
    desc: "Questline: Play 3 cards with Overload. Reward: Summon a 3/3 Elemental with Taunt.",
    mana: 0,
    class: "Shaman",
    rarity: "Legendary",
    set: "United in Stormwind",
    uncollectible: true,
    id: 75,

    cast(plr, game, card) {
        game.functions.addQuest("Quest", plr, card, "GainOverload", 3, (val, game, turn, normal_done) => {
            if (card.storage.length >= 2) {
                game.summonMinion(new game.Card("Living Earth", plr), plr);
                return true;
            }

            game.functions.progressQuest(card.displayName, 1);
            card.storage.push(val);
            return false;
        }, "Tame the Flames", true);
    }
}
