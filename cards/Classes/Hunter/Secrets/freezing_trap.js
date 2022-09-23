module.exports = {
    name: "Freezing Trap",
    desc: "Secret: When an enemy minion attacks, return it to its owner's hand, it costs (2) more.",
    mana: 2,
    class: "Hunter",
    rarity: "Common",
    set: "Core",
    spellClass: "Frost",

    cast(plr, game, card) {
        game.functions.addSecret(plr, card, "minionsThatAttacked", 1, (minion, game, turn) => {
            if (minion[0].plr != game.player) return false;

            let m = new game.Minion(minion[0].getName(), game.player);
            m.mana += 2;
            game.functions.addToHand(m, m.plr, false);

            minion[0].destroy();

            return true;
        }, true);
    }
}