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
        let remove = game.functions.addEventListener("", true, () => {
            plr.getOpponent().hand.filter(c => c.type == "Spell").forEach(c => {
                //c.mana += 5;
                if (!c.enchantmentExists("+5 mana", self)) c.addEnchantment("+5 mana", self);
            });
        }, -1);

        game.functions.addEventListener("EndTurn", (val) => {
            return game.player != plr;
        }, () => {
            plr.getOpponent().hand.filter(c => c.type == "Spell").forEach(c => {
                c.removeEnchantment("+5 mana", self);
            });

            remove();
        }, 1);
    }
}
