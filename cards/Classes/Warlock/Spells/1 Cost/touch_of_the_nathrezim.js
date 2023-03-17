module.exports = {
    name: "Touch of the Nathrezim",
    desc: "Deal 2 damage to a minion. If it dies, restore 3 Health to your hero.",
    mana: 1,
    class: "Warlock",
    rarity: "Rare",
    set: "United in Stormwind",
    spellClass: "Shadow",
    id: 291,

    cast(plr, game, self) {
        let target = game.interact.selectTarget("Deal 2 damage to a minion.", true, null, "minion");
        if (!target) return -1;

        game.attack(2, target);

        if (target.getHealth() <= 0) plr.addHealth(3);
    }
}
