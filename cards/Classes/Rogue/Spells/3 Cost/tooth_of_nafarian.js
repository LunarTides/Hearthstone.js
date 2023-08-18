// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Tooth of Nafarian",
    desc: "Deal 2 damage. &BDiscover&R a spell from another class.",
    mana: 3,
    type: "Spell",
    class: "Rogue",
    rarity: "Common",
    set: "Onyxia's Lair",
    id: 280,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let target = game.interact.selectTarget(`Deal ${2 + plr.spellDamage} damage.`, self);
        if (!target) return -1;

        game.functions.spellDmg(target, 2);

        // Discover a spell from another class
        let list = game.functions.getCards();
        list = list.filter(c => c.type == "Spell" && !game.functions.validateClass(plr, c));
        if (list.length <= 0) return;

        let spell = game.interact.discover("Discover a spell from another class.", list, false);
        if (!spell) return;

        plr.addToHand(spell);
    }
}
