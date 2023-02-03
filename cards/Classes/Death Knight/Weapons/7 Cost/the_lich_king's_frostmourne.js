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

    passive(plr, game, self, trigger) {
        if (!self.passiveCheck(trigger, "enemyAttacks")) return;
        if (trigger[1][0] != plr || !trigger[1][1] instanceof game.Card) return;

        if (trigger[1][1].getHealth() <= self.getAttack()) self.storage.push(trigger[1][1]); // The minion has not taken damage yet.
    },

    deathrattle(plr, game, self) {
        self.storage.forEach(m => {
            let minion = new game.Card(m.name, plr);

            game.summonMinion(minion, plr);
        });
    }
}
