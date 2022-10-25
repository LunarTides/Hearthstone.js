module.exports = {
    name: "Ferocious Howl",
    desc: "Draw a card. Gain 1 Armor for each card in your hand.",
    mana: 3,
    class: "Druid",
    rarity: "Common",
    set: "The Witchwood",

    cast(plr, game, card) {
        plr.drawCard();

        plr.armor += plr.hand.length;
    }
}