module.exports = {
    name: "Thrive in the Shadows",
    desc: "Discover a spell from your deck.",
    mana: 2,
    type: "Spell",
    class: "Priest",
    rarity: "Rare",
    set: "Core",
    spellClass: "Shadow",
    id: 177,

    cast(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Spell");

        let spell = game.interact.discover("Discover a spell from your deck.", list);
        plr.drawSpecific(spell);
    }
}
