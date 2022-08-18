module.exports = {
    name: "Acolyte of Pain",
    stats: [1, 3],
    desc: "Whenever this minion takes damage, draw a card.",
    mana: 3,
    tribe: "None",
    class: "Neutral",
    rarity: "Common",
    set: "Core",

    passive(plr, game, card, trigger) {
        if (trigger[0] = "minionsAttacked" && trigger[1] == card) {
            plr.drawCard();
        }
    }
}