module.exports = {
    name: "Priest Starting Hero",
    displayName: "Anduin Wrynn",
    desc: "Priest starting hero",
    mana: 0,
    class: "Priest",
    rarity: "Free",
    set: "Core",

    heropower(plr, game, self) {
        let target = game.functions.selectTargt("Restore 2 health.", "dontupdate");
        if (!target) return -1;

        t.addHealth(2, true);
    }
}
