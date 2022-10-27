module.exports = {
    name: "Northshire Cleric",
    stats: [1, 3],
    desc: "Whenever a minion is healed, draw a card.",
    mana: 1,
    tribe: "None",
    class: "Priest",
    rarity: "Common",
    set: "Legacy",

    passive(plr, game, self, trigger) {
        if (!self.passiveCheck(trigger, "restoredHealth")) return false;

        plr.drawCard();
    }
}