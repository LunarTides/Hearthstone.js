module.exports = {
    name: "Radiant Elemental",
    stats: [2, 3],
    desc: "Your spells cost (1) less.",
    mana: 2,
    tribe: "Elemental",
    class: "Priest",
    rarity: "Common",
    set: "Core",

    passive(plr, game, card) {
        plr.hand.filter(c => c.type == "Spell").forEach(c => {
            if (c.mana <= 0) return;

            c.mana--;
            card.storage.push(c);
        });
    },

    unpassive(plr, game, card) {
        card.storage.forEach(c => c.mana++);
        card.storage = [];
    }
}