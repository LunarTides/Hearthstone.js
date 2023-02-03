module.exports = {
    name: "Rattlegore",
    stats: [9, 9],
    desc: "Deathrattle: Resummon this with -1/-1.",
    mana: 9,
    tribe: "Undead",
    class: "Warrior",
    rarity: "Legendary",
    set: "Scholomance Academy",
    id: 133,

    deathrattle(plr, game, self) {
        let stats = self.backups.stats;

        let copy = new game.Card(self.name, plr);
        copy.stats = [stats[0] - 1, stats[1] - 1];
        copy.backups.stats = copy.stats;

        game.summonMinion(copy, plr);
    }
}
