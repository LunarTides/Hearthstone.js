module.exports = {
    name: "Fel Barrage",
    desc: "Deal 2 damage to the lowest Health enemy, twice.",
    mana: 2,
    class: "Demon Hunter",
    rarity: "Common",
    set: "United in Stormwind",
    spellClass: "Fel",
    id: 200,

    cast(plr, game, self) {
        let lowestHealth = plr.getOpponent();

        game.board[plr.getOpponent().id].forEach(m => {
            if (m.getHealth() < lowestHealth.getHealth()) lowestHealth = m;
        });

        game.functions.spellDmg(lowestHealth, 2);
        game.functions.spellDmg(lowestHealth, 2);
    }
}
