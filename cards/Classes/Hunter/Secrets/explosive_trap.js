module.exports = {
    name: "Explosive Trap",
    desc: "Secret: When your hero is attacked, deal 2 damage to all enemies.",
    mana: 2,
    class: "Hunter",
    rarity: "Common",
    set: "Core",
    spellClass: "Fire",

    cast(plr, game, card) {
        game.functions.addQuest("Secret", plr, card, "minionsThatAttackedHero", 1, (minion, game, turn) => {
            game.board[game.player.id].forEach(i => {
                game.functions.spellDmg(i, 2);
            });
            game.functions.spellDmg(game.player, 2);

            return true;
        }, null);
    }
}