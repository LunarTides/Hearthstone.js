module.exports = {
    name: "Generous Mummy",
    stats: [5, 4],
    desc: "Reborn. Your opponent's cards cost (1) less.",
    mana: 3,
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "Saviors of Uldum",
    keywords: ["Reborn"],

    passive(plr, game, card) {
        plr.getOpponent().hand.forEach(c => {
            let cont = false;

            card.storage.forEach(i => {
                if (i[0] == c) {
                    cont = true;
                }
            });

            if (!cont) {
                card.storage.push([c, c.backups.mana]);
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