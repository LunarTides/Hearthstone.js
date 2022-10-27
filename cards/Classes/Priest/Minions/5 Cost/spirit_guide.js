module.exports = {
    name: "Spirit Guide",
    stats: [5, 5],
    desc: "Taunt. Deathrattle: Draw a Holy spell and a Shadow spell.",
    mana: 5,
    tribe: "None",
    class: "Priest",
    rarity: "Common",
    set: "Fractured in Alterac Valley",

    deathrattle(plr, game, self) {
        let possible_holy_cards = Object.values(plr.deck).filter(c => c.type == "Spell" && c.spellClass && c.spellClass == "Holy");
        if (possible_holy_cards.length) plr.drawSpecific(new game.Card(game.functions.randList(possible_holy_cards).name, plr));

        let possible_shadow_cards = Object.values(plr.deck).filter(c => c.type == "Spell" && c.spellClass && c.spellClass == "Shadow");
        if (possible_shadow_cards.length) plr.drawSpecific(new game.Card(game.functions.randList(possible_shadow_cards), plr));
    }
}