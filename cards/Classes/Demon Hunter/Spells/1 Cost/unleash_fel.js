module.exports = {
    name: "Unleash Fel",
    desc: "Deal 1 damage to all enemies. Manathirst (6): With Lifesteal.",
    mana: 1,
    class: "Demon Hunter",
    rarity: "Rare",
    set: "March of the Lich King",
    spellClass: "Fel",
    id: 199,

    cast(plr, game, self) {
        let manathirst = self.manathirst(6);

        let doDamage = (t) => {
            game.functions.spellDmg(t, 1);
            if (manathirst) plr.addHealth(1 + plr.spellDamage);
        }

        game.functions.doPlayerTargets(plr.getOpponent(), doDamage);
    }
}
