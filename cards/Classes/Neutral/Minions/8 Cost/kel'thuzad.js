module.exports = {
    name: "Kel'Thuzad",
    stats: [6, 8],
    desc: "At the end of each turn, summon all friendly minions that died this turn.",
    mana: 8,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Legendary",
    set: "Naxxramas",
    id: 120,

    passive(plr, game, self, key, val) {
        if (!self.passiveCheck([key, val], "EndTurn")) return;

        game.graveyard[plr.id].forEach(m => {
            if (m.plr == plr && m.turnKilled == game.turns) game.summonMinion(new game.Card(m.name, plr), plr);
        });
    }
}
