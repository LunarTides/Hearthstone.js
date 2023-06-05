// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Maxima Blastenheimer",
    stats: [4, 4],
    desc: "Battlecry: Summon a minion from your deck. It attacks the enemy hero, then dies.",
    mana: 6,
    type: "Minion",
    tribe: "None",
    class: "Hunter",
    rarity: "Legendary",
    set: "Madness at the Darkmoon Faire",
    id: 221,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Minion");
        if (!list) return;

        let minion = game.functions.randList(list, false);
        if (!minion) return;

        game.summonMinion(minion, plr);
        game.functions.remove(plr.deck, minion);

        minion.sleepy = false;
        minion.canAttackHero = true;
        minion.resetAttackTimes();

        game.attack(minion, plr.getOpponent());
        minion.kill();
    }
}
