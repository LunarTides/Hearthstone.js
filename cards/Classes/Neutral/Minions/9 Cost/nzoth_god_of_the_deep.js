module.exports = {
    name: "NZoth God of the Deep",
    displayName: "N'Zoth, God of the Deep",
    stats: [5, 7],
    desc: "&BBattlecry:&R Resurrect a friendly minion of each minion type.",
    mana: 9,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Madness at the Darkmoon Faire",
    id: 271,

    battlecry(plr, game, self) {
        // Code taken from The Purator

        // Look for the different minion types.
        let ignored_tribes = ["None"];
        let minion_types = game.graveyard[plr.id].filter(c => !ignored_tribes.includes(c.tribe)).map(m => m.tribe);

        // Remove duplicates
        minion_types = new Set(minion_types);
        minion_types = Array.from(minion_types);

        // Split dual types
        minion_types.forEach(t => {
            let s = t.split(" / ");
            if (s.length <= 1) return;

            s.forEach(type => {
                if (minion_types.includes(type)) return;

                minion_types.push(type);
            });
        });

        // Select and resurrect one of each minion type
        minion_types.forEach(t => {
            let list = game.graveyard[plr.id].filter(c => c.tribe.includes(t));
            let minion = game.functions.randList(list); // By not putting false into the second argument, this also creates an imperfect copy of the minion
            // Also make sure that nzoth has enough space to be put on the board
            if (!minion || game.board[plr.id].length >= (game.config.maxBoardSpace - 1)) return;

            game.summonMinion(minion, plr);
        });
    }
}
