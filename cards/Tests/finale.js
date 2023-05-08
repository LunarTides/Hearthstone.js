module.exports = {
    name: "Finale Test",
    stats: [2, 1],
    desc: "&BBattlecry:&R Summon a 1/1 Sheep. &BFinale:&R Give it +1/+1.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    uncollectible: true,

    finale(plr, game, self) {
        self.storage.push([2, 2]);
    },

    battlecry(plr, game, self) {
        if (self.storage.length <= 0) self.storage.push([1, 1]);

        let [attack, health] = self.storage[0];

        // Create the sheep
        let sheep = new game.Card("Sheep", plr);

        sheep.setStats(attack, health);
        game.summonMinion(sheep, plr);
    },

    // This is optional
    condition(plr, game, self) {
        return (plr[self.costType] - self.mana) == 0; // Finale condition
    }
}
