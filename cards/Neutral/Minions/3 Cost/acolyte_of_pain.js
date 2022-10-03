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
        if (!card.passiveCheck(trigger, "minionsAttacked") || trigger[1][1] != card) return;
        if (!Array.isArray(card.storage) && card.stats[1] < card.storage) plr.drawCard();

        card.storage = card.stats[1];
    },

    deathrattle(plr, game, card) {
        // Quick fix
        plr.drawCard();
    }
}