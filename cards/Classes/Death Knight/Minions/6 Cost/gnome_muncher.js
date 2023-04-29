module.exports = {
    name: "Gnome Muncher",
    stats: [5, 6],
    desc: "Taunt, Lifesteal. At the end of your turn, attack the lowest Health enemy.",
    mana: 6,
    type: "Minion",
    tribe: "Undead",
    class: "Death Knight",
    rarity: "Common",
    set: "Core",
    runes: "B",
    keywords: ["Taunt", "Lifesteal"],
    id: 194,

    endofturn(plr, game, self) {
        const getHealth = (t) => {
            if (t instanceof game.Card) return t.getHealth();
            return t.health;
        }

        let lowestHealth = plr.getOpponent();

        game.board[plr.getOpponent().id].forEach(c => {
            if (getHealth(c) < getHealth(lowestHealth)) lowestHealth = c;
        });

        self.sleepy = false;
        self.resetAttackTimes();

        game.attack(self, lowestHealth);
    }
}
