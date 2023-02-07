module.exports = {
    name: "Chitinous Plating",
    desc: "Gain 4 Armor. At the start of your next turn, gain 4 more.",
    mana: 2,
    class: "Druid",
    rarity: "Rare",
    set: "March of the Lich King",
    id: 137,

    cast(plr, game, self) {
        plr.armor += 4;

        self.storage.push(game.passives.push((game, key, val) => {
            if (!self.passiveCheck([key, val], "turnStarts")) return;
            if (game.player == plr) return;

            plr.armor += 4;

            game.passives.splice(self.storage[0] - 1, 1);
        }));
    }
}
