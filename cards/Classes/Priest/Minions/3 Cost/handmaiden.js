module.exports = {
    name: "Handmaiden",
    stats: [3, 2],
    desc: "Battlecry: If you've cast three spells while holding this, draw 3 cards.",
    mana: 3,
    tribe: "Naga",
    class: "Priest",
    rarity: "Rare",
    set: "Voyage to the Sunken City",
    id: 178,

    handpassive(plr, game, self, key, val) {
        if (key != "cardsPlayed" || val.type != "Spell") return;

        if (self.storage.length == 0) self.storage.push(0);
        self.storage[0]++;

        if (self.storage[0] >= 3) self.desc = self.backups.desc + " (Condition cleared)".gray;
    },

    battlecry(plr, game, self) {
        if (self.storage[0] < 3) return;

        for (let i = 0; i < 3; i++) plr.drawCard();
    }
}
