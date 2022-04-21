module.exports = {
    name: "Barkskin",
    type: "Spell",
    desc: "Give a minion +3 Health. Gain 3 Armor.",
    mana: 1,
    class: "Druid",
    rarity: "Common",
    set: "Kobolds and Catacombs",
    spellClass: "Nature",

    cast(plr, game, card) {
        let target = game.functions.selectTarget("Give a minion +3 Health.", true, null, "minion");

        if (target) {
            target.addStats(0, 3);
        }

        plr.armor += 3;
    }
}