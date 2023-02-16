module.exports = {
    name: "Arcane Dynamo",
    stats: [3, 4],
    desc: "Battlecry: Discover a spell that costs (5) or more.",
    mana: 6,
    tribe: "None",
    class: "Neutral",
    rarity: "Rare",
    set: "The Boomsday Project",
    id: 193,

    battlecry(plr, game, self) {
        let list = Object.values(game.functions.getCards());
        list = list.filter(c => game.functions.getType(c) == "Spell" && c.mana >= 5 && [plr.heroClass, "Neutral"].includes(c.class));
        if (list.length <= 0) return;

        game.interact.discover("Discover a spell that costs (5) or more", list);
    }
}
