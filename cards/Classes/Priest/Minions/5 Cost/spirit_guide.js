module.exports = {
    name: "Spirit Guide",
    stats: [5, 5],
    desc: "Taunt. Deathrattle: Draw a Holy spell and a Shadow spell.",
    mana: 5,
    tribe: "None",
    class: "Priest",
    rarity: "Common",
    set: "Fractured in Alterac Valley",
    keywords: ["Taunt"],

    deathrattle(plr, game, self) {
        const f = (l) => {
            let card = game.functions.randList(l);
            plr.drawSpecific(card);
        }

        let possible_holy_cards = Object.values(plr.deck).filter(c => c.type == "Spell" && c.spellClass && c.spellClass == "Holy");
        if (possible_holy_cards.length) f(possible_holy_cards);

        let possible_shadow_cards = Object.values(plr.deck).filter(c => c.type == "Spell" && c.spellClass && c.spellClass == "Shadow");
        if (possible_shadow_cards.length) f(possible_shadow_cards);
    }
}