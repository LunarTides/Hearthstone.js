module.exports = {
    name: "Conjured Arrow",
    desc: "Deal 2 damage to a minion. Manathirst (6): Draw that many cards.",
    mana: 2,
    type: "Spell",
    class: "Hunter",
    rarity: "Rare",
    set: "March of the Lich King",
    spellClass: "Arcane",
    id: 219,

    cast(plr, game, self) {
        let dmg = 2 + plr.spellDamage;

        let target = game.interact.selectTarget(`Deal ${dmg} damage to a minion.`);
        if (!target) return -1;

        game.functions.spellDmg(target, 2);

        if (self.manathirst(6)) for (let i = 0; i < dmg; i++) plr.drawCard();
    }
}
