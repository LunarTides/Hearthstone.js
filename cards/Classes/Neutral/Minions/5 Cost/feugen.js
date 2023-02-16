module.exports = {
    name: "Feugen",
    stats: [4, 7],
    desc: "Deathrattle: If Stalagg also died this game, summon Thaddius.",
    mana: 5,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Legendary",
    set: "Naxxramas",
    id: 205,

    deathrattle(plr, game, self) {
        let stalaggDied = false;

        game.graveyard.forEach(p => {
            p.forEach(m => {
                if (m.name == "Stalagg") stalaggDied = true;
            });
        });

        if (!stalaggDied) return;

        // Condition Cleared
        let minion = new game.Card("Thaddius", plr);
        game.summonMinion(minion, plr);
    }
}
