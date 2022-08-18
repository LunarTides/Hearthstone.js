module.exports = {
    name: "Seance",
    desc: "Choose a minion. Add a copy of it to your hand.",
    mana: 2,
    class: "Priest",
    rarity: "Common",
    set: "Rastakhan's Rumble",
    spellClass: "Shadow",

    cast(plr, game, card) {
        let target = game.functions.selectTarget("Choose a minion.", true, null, "minion");

        if (!target) {
            return -1;
        }

        game.functions.addToHand(new game.Minion(target.getName(), plr), plr);
    }
}