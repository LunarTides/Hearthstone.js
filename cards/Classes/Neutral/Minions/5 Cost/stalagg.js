module.exports = {
    name: "Stalagg",
    stats: [7, 4],
    desc: "Deathrattle: If Feugen also died this game, summon Thaddius.",
    mana: 5,
    type: "Minion",
    tribe: "Undead",
    class: "Neutral",
    rarity: "Legendary",
    set: "Naxxramas",
    id: 206,

    deathrattle(plr, game, self) {
        let feugenDied = false;

        game.graveyard.forEach(p => {
            p.forEach(m => {
                if (m.name == "Feugen") feugenDied = true;
            });
        });

        if (!feugenDied) return;

        // Condition cleared
        let minion = new game.Card("Thaddius", plr);
        game.summonMinion(minion, plr);
    }
}
