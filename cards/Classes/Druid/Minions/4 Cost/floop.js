module.exports = {
    name: "Floop",
    displayName: "Flobbidinous Floop",
    stats: [3, 4],
    desc: "While in your hand, this is a 3/4 copy of the last minion you played.",
    mana: 4,
    tribe: "None",
    class: "Druid",
    rarity: "Legendary",
    set: "The Boomsday Project",
    id: 152,

    handpassive(plr, game, self, key, val) {
        if (key != "cardsPlayed") return;
        if (val.type != "Minion" || val.plr != plr) return;

        self.storage.length = 0;
        self.desc = self.backups.desc + " (This is currently ".gray + game.functions.colorByRarity(val.displayName, val.rarity) + ")".gray;
        self.storage.push(val);
    },

    battlecry(plr, game, self) {
        if (self.storage.length == 0) return;

        let minion = new game.Card(self.storage[0].name, plr);
        minion.stats = [3, 4];

        self.destroy();
        game.summonMinion(minion, plr, false);

        minion.activate("battlecry");
    }
}