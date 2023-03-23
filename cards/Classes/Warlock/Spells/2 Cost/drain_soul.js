module.exports = {
    name: "Drain Soul",
    desc: "&BLifesteal.&R Deal 3 damage to a minion.",
    mana: 2,
    class: "Warlock",
    rarity: "Common",
    set: "Knights of the Frozen Throne",
    spellClass: "Shadow",
    id: 301,

    cast(plr, game, self) {
        let target = game.interact.selectTarget(self.desc, true, null, "minion");
        if (!target) return -1;

        game.functions.spellDmg(target, 3);

        plr.addHealth(3 + plr.spellDamage);
    }
}
