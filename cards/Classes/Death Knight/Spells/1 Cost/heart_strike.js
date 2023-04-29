module.exports = {
    name: "Heart Strike",
    desc: "Deal 3 damage to a minion. If that kills it, gain a Corpse.",
    mana: 1,
    type: "Spell",
    class: "Death Knight",
    rarity: "Common",
    set: "Core",
    runes: "B",
    id: 182,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Deal 3 damage to a minion. If that kills it, gain a Corpse", true, null, "minion");
        if (!target) return -1;

        let newHealth = game.functions.spellDmg(target, 3);

        if (newHealth > 0) return;

        // Gain a corpse
        plr.corpses++;
    }
}
