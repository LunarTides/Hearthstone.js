module.exports = {
    name: "Power Word Fortitude",
    displayName: "Power Word: Fortitude",
    desc: "Give a minion +3/+5. Costs (1) less for each spell in your hand.",
    mana: 8,
    class: "Priest",
    rarity: "Common",
    set: "Forged in the Barrens",
    spellClass: "Holy",
    id: 180,

    passive(plr, game, self, key, val) {
        self.mana = self.backups.mana - plr.hand.filter(c => c.type == "Spell").length;
        if (self.mana < 0) self.mana = 0;
    },

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Give a minion +3/+5.", true, null, "minion");
        if (!target) return -1;

        target.addStats(3, 5);
    }
}
