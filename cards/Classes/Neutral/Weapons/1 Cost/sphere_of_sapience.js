// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Sphere of Sapience",
    stats: [0, 4],
    desc: "At the start of your turn, look at your top card. You can put it on the bottom and lose 1 Durability.",
    mana: 1,
    type: "Weapon",
    class: "Neutral",
    rarity: "Legendary",
    set: "Scholomance Academy",
    id: 60,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        if (key != "StartTurn" || game.player == plr) return;

        let top = plr.deck.pop();
        
        if (!top) return;

        game.interact.printName();
        game.interact.printAll(plr);

        let answer = game.interact.yesNoQuestion(plr, "Put " + top.name + " on the bottom of your deck?");

        if (answer) {
            plr.deck.unshift(top);
            self.remStats(0, 1);
        } else plr.deck.push(top);
    }
}
