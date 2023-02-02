module.exports = {
    name: "Barricade",
    desc: "Summon a 2/4 Guard with Taunt. If it's your only minion, summon another.",
    mana: 4,
    class: "Warrior",
    rarity: "Common",
    set: "Madness at the Darkmoon Faire",
    id: 114,

    cast(plr, game, self) {
        let minion = new game.Card("Race Guard", plr);
        
        game.summonMinion(minion, plr);
        if (game.board[plr.id].length == 1) game.summonMinion(game.functions.cloneCard(minion, plr), plr);
    }
}
