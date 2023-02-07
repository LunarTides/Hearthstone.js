module.exports = {
    name: "Floop's Gloop",
    displayName: "Floop's Glorious Gloop",
    desc: "Whenever a minion dies this turn, gain 1 Mana Crystal this turn only.",
    mana: 1,
    class: "Druid",
    rarity: "Legendary",
    set: "The Boomsday Project",
    spellClass: "Nature",
    id: 138,

    cast(plr, game, self) {
        // Gain Mana
        self.storage.push(game.passives.push((game, key, val) => {
            if (!self.passiveCheck([key, val], "minionsKilled")) return;
            
            plr.refreshMana(1, plr.maxMaxMana);
        }));

        // Remove effect after 1 turn
        self.storage.push(game.passives.push((game, key, val) => {
            if (!self.passiveCheck([key, val], "turnEnds")) return;
            if (!game.player == plr) return;

            game.passives.splice(self.storage[0] - 1, 1);
            game.passives.splice(self.storage[1] - 1, 1);
        }));
    }
}
