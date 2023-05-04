module.exports = {
    name: "Faceless Lackey",
    stats: [1, 1],
    desc: "Battlecry: Summon a random 2-Cost minion.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",
    uncollectible: true,
    id: 89,

    battlecry(plr, game) {
        // filter out all cards that aren't 2-cost minions
        let minions = game.functions.getCards().filter(card => card.type === "Minion" && card.mana === 2);
        rand = game.functions.randList(minions);
        if (!rand) return;

        game.summonMinion(new game.Card(rand.name, plr), plr);
    }
}
