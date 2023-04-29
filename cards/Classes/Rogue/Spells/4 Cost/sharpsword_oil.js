module.exports = {
    name: "Sharpsword Oil",
    displayName: "Tinker's Sharpsword Oil",
    desc: "Give your weapon +3 Attack. &BCombo:&R Give a random friendly minion +3 Attack.",
    mana: 4,
    type: "Spell",
    class: "Rogue",
    rarity: "Common",
    set: "Goblins vs Gnomes",
    id: 284,

    cast(plr, game, self) {
        if (!plr.weapon) return -1;

        plr.weapon.addStats(3, 0);
    },

    combo(plr, game, self) {
        if (game.board[plr.id].length <= 0) return;

        let minion = game.functions.randList(game.board[plr.id], false);
        minion.addStats(3, 0);
    }
}
