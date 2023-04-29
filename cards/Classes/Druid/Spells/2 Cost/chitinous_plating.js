module.exports = {
    name: "Chitinous Plating",
    desc: "Gain 4 Armor. At the start of your next turn, gain 4 more.",
    mana: 2,
    type: "Spell",
    class: "Druid",
    rarity: "Rare",
    set: "March of the Lich King",
    id: 137,

    cast(plr, game, self) {
        plr.armor += 4;

        game.functions.addEventListener("StartTurn", (val) => {
            return game.player != plr;
        }, () => {
            plr.armor += 4;
        }, 1);
    }
}
