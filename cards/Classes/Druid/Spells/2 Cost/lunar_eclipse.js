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
        let passiveIndex = game.passives.push((game, key, val) => {
            plr.hand.filter(c => c.type == "Spell").forEach(c => {
                if (self.storage.map(k => k[0]).includes(c)) return;
                let oldMana = c.mana;

                c.mana -= 2;
                if (c.mana < 0) c.mana = 0;
                self.storage.push([c, oldMana]);
            });
        });

        let reverted = false;

        // Remove reduction when card played
        game.functions.addTempPassive("cardsPlayed",
            // Test value
            (key, val) => {
                return val != self && val.type == "Spell" && !reverted;
            },
            // Do logic
            () => {
                self.storage.forEach(c => {
                    c[0].mana = c[1];
                });

                game.passives.splice(passiveIndex - 1, 1);

                reverted = true;
            }
        );

        // Remove reduction when turn ends
        game.functions.addTempPassive("turnEnds",
            (key, val) => {
                return game.player == plr && !reverted;
            },
            () => {
                self.storage.forEach(c => {
                    c[0].mana = c[1];
                });

                game.passives.splice(passiveIndex - 1, 1);

                reverted = true;
            }
        );
    }
}
