module.exports = {
    name: "Elwynn Boar Sword",
    displayName: "Sword of a Thousand Truths",
    stats: [15, 3],
    desc: "After your hero attacks, destroy your opponent's Mana Crystals.",
    mana: 10,
    type: "Weapon",
    class: "Neutral",
    rarity: "Free",
    set: "United in Stormwind",
    uncollectible: true,
    id: 136,

    passive(plr, game, self, key, val) {
        if (key != "Attack") return;

        const [attacker, target] = val;
        if (attacker != plr) return;

        let op = plr.getOpponent();

        op.mana = 0;
        op.maxMana = 0;
    }
}
