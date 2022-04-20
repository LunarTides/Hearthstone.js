module.exports = {
    name: "Faceless Lackey",
    type: "Minion",
    stats: [1, 1],
    desc: "Battlecry: Summon a random 2-Cost minion.",
    mana: 1,
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",

    battlecry(plr, game) {
        // filter out all cards that aren't 2-cost minions
        let minions = Object.values(game.cards).filter(card => card.type === "Minion" && card.mana === 2);
        minions = game.functions.accountForUncollectible(minions);
        rand = game.functions.randList(minions);

        game.playMinion(new game.Minion(rand.name, plr), plr);
    }
}