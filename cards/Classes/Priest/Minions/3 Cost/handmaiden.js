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
    conditioned: ["battlecry"],

    handpassive(plr, game, self, key, val) {
        if (key != "PlayCard" || val.type != "Spell" || game.player != plr) return;

        if (self.storage.length == 0) self.storage.push(0);
        self.storage[0]++;
    },

    battlecry(plr, game, self) {
        for (let i = 0; i < 3; i++) plr.drawCard();
    },

    condition(plr, game, self) {
        return self.storage[0] >= 3;
    }
}
