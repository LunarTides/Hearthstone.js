module.exports = {
    name: "Gadgetzan Auctioneer",
    stats: [4, 4],
    desc: "Whenever you cast a spell, draw a card.",
    mana: 6,
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "Core",

    passive(plr, game, card, trigger) {
        if (!card.passiveCheck(trigger, "spellsCast", null, plr)) return;
        
        plr.drawCard();
    }
}