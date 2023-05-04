module.exports = {
    name: "Radiant Elemental",
    stats: [2, 3],
    desc: "Your spells cost (1) less.",
    mana: 2,
    type: "Minion",
    tribe: "Elemental",
    class: "Priest",
    rarity: "Common",
    set: "Core",
    id: 63,

    passive(plr, game, card, key, val) {
        plr.hand.filter(c => c.type == "Spell").forEach(c => {
            //c.mana--;
            if (!c.enchantmentExists("-1 mana", card)) c.addEnchantment("-1 mana", card);
        });
    }
}
