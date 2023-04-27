module.exports = {
    name: "Acolyte of Pain",
    stats: [1, 3],
    desc: "Whenever this minion takes damage, draw a card.",
    mana: 3,
    tribe: "None",
    class: "Neutral",
    rarity: "Common",
    set: "Core",
    id: 41,

    passive(plr, game, card, key, val) {
        if (key != "DamageMinion" || val[0] != card) return;

        plr.drawCard();
    }
}
