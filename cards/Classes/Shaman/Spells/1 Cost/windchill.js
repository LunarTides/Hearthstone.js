// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Windchill",
    desc: "&BFreeze&R a minion. Draw a card.",
    mana: 1,
    type: "Spell",
    class: "Shaman",
    rarity: "Common",
    spellClass: "Frost",
    id: 303,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, true, null, "minion");
        if (!target) return -1;

        target.freeze();
        plr.drawCard();
    }
}
