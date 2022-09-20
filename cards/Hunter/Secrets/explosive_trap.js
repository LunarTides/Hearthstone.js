module.exports = {
    name: "Explosive Trap",
    desc: "Secret: When your hero is attacked, deal 2 damage to all enemies.",
    mana: 2,
    class: "Hunter",
    rarity: "Common",
    set: "Core",
    spellClass: "Fire",

    cast(plr, game, card) {
        game.functions.addSecret(plr, card, "minionsThatAttackedHero", 1, (minion, game, turn) => {
            if (minion[0].plr != game.turn) return false;

            game.getBoard()[game.turn.id].forEach(i => {
                game.functions.spellDmg(i, 2);
            });
            game.functions.spellDmg(game.turn, 2);

            return true;
        }, true);
    }
}