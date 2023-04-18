module.exports = {
    name: "Preparation",
    desc: "The next spell you cast this turn costs (2) less.",
    mana: 0,
    class: "Rogue",
    rarity: "Epic",
    set: "Legacy",
    id: 272,

    cast(plr, game, self) {
        let stop = false;

        const undo = () => {
            if (stop) return true;

            stop = true;

            plr.hand.filter(c => c.type == "Spell").forEach(s => {
                s.removeEnchantment("-2 mana", self);
            });

            return true;
        }

        game.functions.addPassive("", true, () => {
            if (stop) return true;

            plr.hand.filter(c => c.type == "Spell").forEach(s => {
                if (!s.enchantmentExists("-2 mana", self)) s.addEnchantment("-2 mana", self);
            });
        }, -1);

        game.functions.addPassive("turnEnds", () => {return true}, undo, 1);
        game.functions.addPassive("cardsPlayed", (val) => {
            return val.type == "Spell" && val != self;
        }, undo, 1);
    }
}
