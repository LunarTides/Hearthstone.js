module.exports = {
    name: "Lunar Eclipse",
    desc: "Deal 3 damage to a minion. Your next spell this turn costs (2) less.",
    mana: 2,
    class: "Druid",
    rarity: "Common",
    set: "Madness at the Darkmoon Faire",
    spellClass: "Arcane",
    id: 139,

    cast(plr, game, self) {
        // Deal 3 damage to a minion.
        let minion = game.interact.selectTarget("Deal 3 damage to a minion.", true, null, "minion");
        if (!minion) return -1;

        game.functions.spellDmg(minion, 3);

        // Your next spell this turn costs 2 less.
        self.storage = [[], []];

        plr.hand.filter(c => c.type == "Spell").forEach(c => {
            if (self.storage[1].map(k => k[0]).includes(c)) return;
            let oldMana = c.mana;

            c.mana -= 2;
            if (c.mana < 0) c.mana = 0;
            self.storage[1].push([c, oldMana]);
        });

        // Remove reduction when spell played
        self.storage[0].push(game.passives.push((game, key, val) => {
            if (!self.passiveCheck([key, val], "cardsPlayed")) return;
            if (val == self || val.type != "Spell") return;

            self.storage[1].forEach(c => {
                c[0].mana += c[1];
            });

            game.passives.splice(self.storage[0][0] - 1, 1);
        }));

        // Remove reduction next turn
        self.storage[0].push(game.passives.push((game, key, val) => {
            if (!self.passiveCheck([key, val], "turnEnds")) return;
            if (game.player != plr) return;

            self.storage[1].forEach(c => {
                c[0].mana += c[1];
            });

            if (self.storage[0].length > 1) game.passives.splice(self.storage[0][1] - 1, 1);
            game.passives.splice(self.storage[0][0] - 1, 1);
        }));
    }
}
