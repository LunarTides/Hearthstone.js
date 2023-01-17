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
    id: 45,

    passive(plr, game, card) {
        plr.getOpponent().hand.forEach(c => {
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