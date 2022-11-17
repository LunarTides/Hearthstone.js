module.exports = {
    name: "Seance",
    desc: "Choose a minion. Add a copy of it to your hand.",
    mana: 2,
    class: "Priest",
    rarity: "Common",
    set: "Rastakhan's Rumble",
    spellClass: "Shadow",

    cast(plr, game, card) {
        let target = game.functions.selectTarget("Add a copy of a minion to your hand.", true, null, "minion");

        if (!target) {
            return -1;
        }

        plr.addToHand(new game.Card(target.name, plr));
    }
}
