module.exports = {
    name: "Flarks BoomZooka",
    displayName: "Flark's Boom-Zooka",
    desc: "Summon 3 minions from your deck. They attack enemy minions, then die.",
    mana: 7,
    class: "Hunter",
    rarity: "Legendary",
    set: "The Boomsday Project",
    id: 228,

    cast(plr, game, self) {
        let opBoard = game.board[plr.getOpponent().id];
        let currBoard = game.board[plr.id];

        const doAttack = (attacker) => {
            if (opBoard.length <= 0) return;

            let rand = game.functions.randInt(0, opBoard.length - 1);
            let minion = opBoard[rand];

            attacker.sleepy = false;
            attacker.resetAttackTimes();

            game.attack(attacker, minion);
            game.killMinions();
        }

        let minions = [];

        let list = plr.deck.filter(c => c.type == "Minion");

        for (let i = 0; i < 3; i++) {
            let minion = game.functions.randList(list, false);
            if (!minion) continue;

            game.functions.remove(list, minion);
            game.functions.remove(plr.deck, minion);
            minions.push(minion);

            game.summonMinion(minion, plr);
        }

        minions.forEach(m => {
            doAttack(m);
            m.kill();
        });
    }
}
