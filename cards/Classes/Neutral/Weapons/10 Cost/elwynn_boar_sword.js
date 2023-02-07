module.exports = {
    name: "Elwynn Boar Sword",
    displayName: "Sword of a Thousand Truths",
    stats: [15, 3],
    desc: "After your hero attacks, destroy your opponent's Mana Crystals.",
    mana: 10,
    class: "Neutral",
    rarity: "Free",
    set: "United in Stormwind",
    uncollectible: true,
    id: 136,

    onattack(plr, game, self) {
        let op = plr.getOpponent();

        op.mana = 0;
        op.maxMana = 0;
    }
}
