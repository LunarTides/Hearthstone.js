// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Floop",
    displayName: "Flobbidinous Floop",
    stats: [3, 4],
    desc: "While in your hand, this is a 3/4 copy of the last minion you played.",
    mana: 4,
    type: "Minion",
    tribe: "None",
    class: "Druid",
    rarity: "Legendary",
    set: "The Boomsday Project",
    id: 152,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    handpassive(plr, game, self, key, val) {
        if (key != "PlayCard") return;
        if (val.type != "Minion" || val.plr != plr) return;

        self.storage.length = 0;
        self.desc = self.backups.init.desc + " (This is currently ".gray + game.functions.colorByRarity(val.displayName, val.rarity) + ")".gray;
        self.storage.push(val);
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        if (self.storage.length == 0) return;

        let minion = new game.Card(self.storage[0].name, plr);
        minion.stats = [3, 4];

        self.destroy();

        game.suppressedEvents.push("SummonMinion");
        game.summonMinion(minion, plr);
        game.suppressedEvents.pop();

        minion.activate("battlecry");
    }
}
