module.exports = {
    name: "Dormant Example",
    stats: [8, 8],
    desc: "&RDormant&R for 2 turns.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    dormant: 2, // How many turns this minion should be dormant for.
    uncollectible: true,

    battlecry(plr, game, self) {
        // The battlecry only triggers when the minion is no longer dormant.
        game.interact.dredge();
    }
}
