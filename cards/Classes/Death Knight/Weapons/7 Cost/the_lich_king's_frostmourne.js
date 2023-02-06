module.exports = {
    name: "The Lich King's Frostmourne",
    displayName: "Frostmourne",
    stats: [5, 3],
    desc: "Deathrattle: Summon every minion killed by this weapon.",
    mana: 7,
    class: "Death Knight",
    rarity: "Free",
    set: "Knights of the Frozen Throne",
    uncollectible: true,
    id: 129,

    passive(plr, game, self, key, val) {
        if (!self.passiveCheck([key, val], "enemyAttacks")) return;
        if (val[0] != plr || !val[1] instanceof game.Card) return;

        if (val[1].getHealth() <= 0) self.storage.push(val[1]); // The minion has not taken damage yet.
    },

    deathrattle(plr, game, self) {
        self.storage.forEach(m => {
            let minion = new game.Card(m.name, plr);

            game.summonMinion(minion, plr);
        });
    }
}
