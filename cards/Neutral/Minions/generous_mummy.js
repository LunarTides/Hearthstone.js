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
        game.getOtherPlayer(plr).hand.forEach(c => {
            if (c.mana > 0) {
                c.mana--;

                if (!card.storage.includes(c)) {
                    card.storage.push(c);
                }
            }
        });
    },

    unpassive(plr, game, card, ignore) {
        card.storage.forEach(c => {
            c.mana += 1;
        });

        if (!ignore) {
            card.storage = [];
        }
    }
}