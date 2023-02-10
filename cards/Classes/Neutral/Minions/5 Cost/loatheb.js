module.exports = {
    name: "Loatheb",
    stats: [5, 5],
    desc: "Battlecry: Enemy spells cost (5) more next turn.",
    mana: 5,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Legendary",
    set: "Naxxramas",
    id: 158,

    battlecry(plr, game, self) {
        let passiveIndex = game.passives.push((game, key, val) => {
            plr.getOpponent().hand.filter(c => c.type == "Spell").forEach(c => {
                if (self.storage.map(k => k[0]).includes(c)) return;
                let oldMana = c.mana;

                c.mana += 5;

                self.storage.push([c, oldMana]);
            });
        });

        let turnEndsPassiveIndex = game.passives.push((game, key, val) => {
            if (key != "turnEnds") return;
            if (game.player == plr) return;

            self.storage.forEach(c => {
                c[0].mana = c[1];
            });

            game.passives.splice(passiveIndex - 1, 1);
            game.passives.splice(turnEndsPassiveIndex - 1, 1);
        });
    }
}
