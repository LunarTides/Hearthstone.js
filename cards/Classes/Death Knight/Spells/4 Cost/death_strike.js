module.exports = {
    name: "Death Strike",
    desc: "Lifesteal. Deal 6 damage to a minion.",
    mana: 4,
    class: "Death Knight",
    rarity: "Common",
    set: "Core",
    runes: "B",
    id: 190,

    cast(plr, game, self) {
        let dmg = 6 + plr.spellDamage;

        let target = game.interact.selectTarget(`Lifesteal. Deal ${dmg} damage to a minion.`, true, null, "minion");
        if (!target) return -1;

        game.functions.spellDmg(target, 6);
        plr.addHealth(dmg);
    }
}
