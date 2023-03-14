module.exports = {
    name: "Anachronos",
    stats: [8, 8],
    desc: "&BBattlecry: &RSend all other minions 2 turns into the future.",
    mana: 7,
    tribe: "Dragon",
    class: "Paladin",
    rarity: "Legendary",
    set: "March of the Lich King",
    id: 267,

    battlecry(plr, game, self) {
        let minions = [[], []];

        // Destroy and store the minions
        game.board.forEach((p, i) => {
            p.forEach(m => {
                // Create a perfect copy of the card. I do this so that when the card is destroyed, the stored card
                // doesn't have its health set to 0
                let copy = game.functions.cloneCard(m);

                minions[i].push(copy);
                m.destroy();
            });
        });

        // Restore the minions 2 turns later.
        let counter = 0;

        game.functions.addPassive("turnStarts", () => {
            // Only do this when YOUR turn starts
            // game.player gets updated after the turnStarts event. So if game.player == plr, it means that the opponent's turn is starting.
            return game.player != plr;
        }, () => {
            counter++;
            if (counter < 2) return;

            // Restore the minions
            minions.forEach((p, i) => {
                let player = game["player" + (i + 1)];

                p.forEach(m => {
                    // Make sure the minions can't attack right after being resummoned
                    m.sleepy = true;

                    game.summonMinion(m, player);
                });
            });

            return true; // Delete the passive after it has revieved the minions.
        }, -1);
    }
}
