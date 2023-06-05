// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Shadow Visions",
    desc: "Discover a copy of a spell in your deck.",
    mana: 2,
    type: "Spell",
    class: "Priest",
    rarity: "Epic",
    set: "Journey to Un'Goro",
    spellClass: "Shadow",
    id: 176,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Spell");

        let spell = game.interact.discover("Discover a copy of a spell in your deck.", list);
        spell = spell.imperfectCopy();

        plr.addToHand(spell);
    }
}
