module.exports = {
    name: "Oaken Summons",
    desc: "Gain 6 Armor. Recruit a minion that costs (4) or less.",
    mana: 4,
    class: "Druid",
    rarity: "Epic",
    set: "Kobolds & Catacombs",
    spellClass: "Nature",
    id: 23,

    cast(plr, game, card) {
        plr.armor += 6;

        game.functions.recruit(1, [0, 4]);
    }
}