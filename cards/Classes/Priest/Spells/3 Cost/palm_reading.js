module.exports = {
    name: "Palm Reading",
    desc: "Discover a spell. Reduce the Cost of spells in your hand by (1).",
    mana: 3,
    class: "Priest",
    rarity: "Rare",
    set: "Madness at the Darkmoon Faire",
    spellClass: "Shadow",
    id: 179,

    cast(plr, game, self) {
        // Discover a spell
        let list = Object.values(game.functions.getCards()).filter(c => game.functions.getType(c) == "Spell" && [plr.heroClass, "Neutral"].includes(c.class));
        if (list.length == 0) return;
        game.interact.discover("Discover a spell.", list);

        // Reduce the Cost of spells in your hand by (1)
        plr.hand.filter(c => c.type == "Spell").forEach(s => {
            s.mana--;

            if (s.mana < 0) s.mana = 0;
        });
    }
}
