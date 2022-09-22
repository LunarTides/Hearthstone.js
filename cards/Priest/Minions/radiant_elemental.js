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
            let cont = false;

            card.storage.forEach(i => {
                if (i[0] == c) {
                    cont = true;
                }
            });

            if (!cont) {
                card.storage.push([c, c._mana]);
                if (c.mana > 0) {
                    c.mana--;
                }
            }
        });
    },

    unpassive(plr, game, card) {
        card.storage.forEach(c => {
            c[0].mana = c[1];
        });

        card.storage = [];
    }
}