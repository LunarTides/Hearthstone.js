module.exports = {
    name: "Shadow Visions",
    desc: "Discover a copy of a spell in your deck.",
    mana: 2,
    class: "Priest",
    rarity: "Epic",
    set: "Journey to Un'Goro",
    spellClass: "Shadow",
    id: 176,

    cast(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Spell");

        let spell = game.interact.discover("Discover a copy of a spell in your deck.", list);
        spell = spell.imperfectCopy();

        plr.addToHand(spell);
    }
}
