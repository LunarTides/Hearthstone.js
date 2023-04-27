module.exports = {
    name: "Blood Boil",
    desc: "Lifesteal. Infect all enemy minions. At the end of your turns, they take 2 damage.",
    mana: 5,
    class: "Death Knight",
    rarity: "Epic",
    set: "Path of Arthas",
    runes: "BB",
    spellClass: "Shadow",
    id: 192,

    cast(plr, game, self) {
        let infected = [];

        game.board[plr.getOpponent().id].forEach(m => {
            infected.push(m);
        });

        game.functions.addEventListener("EndTurn", (key, val) => {
            return game.player == plr;
        },
        () => {
            let _infected = infected.slice();

            _infected.forEach(m => {
                if (m.getHealth() <= 0) {
                    game.functions.remove(infected, m);
                    return;
                }

                game.functions.spellDmg(m, 2);
                plr.addHealth(2 + plr.spellDamage); // Lifesteal

                if (m.getHealth() <= 0) game.functions.remove(infected, m);
            });

            if (infected.length > 0) return;

            return true; // This will remove the passive
        }, -1); // -1 means the passive lasts forever, or until the callback returns true
    }
}
