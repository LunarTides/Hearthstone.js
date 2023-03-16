module.exports = {
    name: "Spectral Cutlass",
    stats: [2, 2],
    desc: "&BLifesteal.&R Whenever you play a card from another class, gain +1 Durability.",
    mana: 4,
    class: "Rogue",
    rarity: "Epic",
    set: "The Witchwood",
    keywords: ["Lifesteal"],
    id: 283,

    passive(plr, game, self, key, val) {
        if (key != "cardsPlayed" || val.plr != plr || val == self || game.functions.validateClass(plr, val)) return;

        // The card you played was from another class.
        self.addStats(0, 1);
    }
}
