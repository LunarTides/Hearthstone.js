// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Construct Quarter",
    stats: [0, 3],
    desc: "Destroy a friendly minion to summon a 4/5 Undead with &BRush&R",
    mana: 4,
    type: "Location",
    class: "Death Knight",
    rarity: "Rare",
    set: "Return to Naxxramas",
    cooldown: "2",
    id: 1,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    use(plr, game, self) {
        let target = game.interact.selectTarget("Destroy a friendly minion to summon a 4/5 Undead with Rush.", false, "friendly", "minion");
        if (!target) return -1;

        target.kill();

        let minion = new game.Card("Construct Quarter Monstrosity", plr);
        game.summonMinion(minion, plr);
    }
}
