module.exports = {
    name: "Blackwater Behemoth Lure",
    displayName: "Behemoth's Lure",
    stats: [1, 4],
    desc: "At the end of your turn, force a random enemy minion to attack the Blackwater Behemoth.",
    mana: 2,
    tribe: "Beast",
    class: "Priest",
    rarity: "Free",
    set: "Voyage to the Sunken City",
    uncollectible: true,

    endofturn(plr, game, self) {
        let minion = game.functions.randList(game.board[plr.getOpponent().id], false);
        if (!minion) return;

        // Find the behemoth
        let behemoth = game.board[plr.id].filter(c => c.name == "Blackwater Behemoth");
        if (behemoth.length <= 0) return;
        
        behemoth = behemoth[0];

        game.attack(minion, behemoth);
    }
}
