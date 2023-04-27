module.exports = {
    name: "Nerubian Vizier",
    stats: [2, 4],
    desc: "Battlecry: Discover a spell. If a friendly Undead died after your last turn, it costs (2) less.",
    mana: 3,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Common",
    set: "March of the Lich King",
    id: 188,

    battlecry(plr, game, self) {
        let list = game.functions.getCards();
        list = list.filter(c => game.functions.getType(c) == "Spell" && [plr.heroClass, "Neutral"].includes(c.class));
        if (list.length == 0) return;

        let card = game.interact.discover("Discover a spell.", list);

        let valid = game.turns - 1;

        game.graveyard[plr.id].forEach(m => {
            if (valid >= m.turnKilled || !game.functions.matchTribe(m.tribe, "Undead")) return;

            //card.mana -= 2;
            card.addEnchantment("-2 mana", self);
        });
    }
}
