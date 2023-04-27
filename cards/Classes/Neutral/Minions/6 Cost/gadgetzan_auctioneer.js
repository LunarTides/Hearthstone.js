module.exports = {
    name: "Gadgetzan Auctioneer",
    stats: [4, 4],
    desc: "Whenever you cast a spell, draw a card.",
    mana: 6,
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "Core",
    id: 53,

    passive(plr, game, card, key, val) {
        if (key != "spellsCast" || game.player != plr) return;
        
        plr.drawCard();
    }
}
