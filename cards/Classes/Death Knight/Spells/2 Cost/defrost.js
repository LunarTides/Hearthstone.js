module.exports = {
    name: "Defrost",
    desc: "Draw a card. Spend 2 Corpses to draw another.",
    mana: 2,
    class: "Death Knight",
    rarity: "Rare",
    set: "Core",
    spellClass: "Frost",
    runes: ["F"],
            
    cast(plr, game, card) {
        plr.drawCard();

        plr.tradeCorpses(2, () => plr.drawCard());
    }
}
