module.exports = {
    name: "Mage Starting Hero",
    displayName: "Jaina Proudmoore",
    desc: "Mage starting hero",
    mana: 0,
    class: "Mage",
    rarity: "Free",
    set: "Core",
    hpDesc: "Deal 1 damage.",
    uncollectible: true,

    heropower(plr, game, self) {
        const target = game.interact.selectTarget("Deal 1 damage.", "dontupdate");
        if (!target) return -1;

        game.attack(1, target);
    }
}
