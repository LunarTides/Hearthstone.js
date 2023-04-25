module.exports = {
    name: "Shadowcloth Needle",
    stats: [0, 3],
    desc: "After you cast a Shadow spell, deal 1 damage to all enemies. Lose 1 Durability.",
    mana: 1,
    class: "Priest",
    rarity: "Rare",
    set: "United in Stormwind",
    id: 232,

    passive(plr, game, self, key, val) {
        if (key != "PlayCard" || game.player != plr) return;
        if (val.type != "Spell" || !val.spellClass || !val.spellClass.includes("Shadow")) return;

        // The player cast a Shadow spell
        game.functions.doPlayerTargets(plr.getOpponent(), (t) => {
            game.attack(1, t);
        });

        self.remStats(0, 1);
    }
}
