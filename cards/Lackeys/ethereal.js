module.exports = {
    name: "Ethereal Lackey",
    stats: [1, 1],
    desc: "Battlecry: Discover a spell.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    set: "Rise of Shadows",
    uncollectible: true,
    id: 88,

    battlecry(plr, game) {
        let list = game.functions.getCards();
        list = list.filter(c => c.type == "Spell");
        if (list.length <= 0) return;

        let card = game.interact.discover("Discover a spell.", list);
        plr.addToHand(card);
    }
}
