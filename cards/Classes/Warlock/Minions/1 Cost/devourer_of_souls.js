module.exports = {
    name: "Devourer of Souls",
    stats: [1, 3],
    desc: "After a friendly minion dies, gain its &BDeathrattle&R.",
    mana: 1,
    tribe: "Undead",
    class: "Warlock",
    rarity: "Legendary",
    set: "March of the Lich King",
    id: 287,

    passive(plr, game, self, key, val) {
        if (key != "KillMinion" || val.plr != plr || !val.blueprint.deathrattle) return;

        if (!self.deathrattle) self.deathrattle = [];
        self.deathrattle.push(val.blueprint.deathrattle);
    }
}
