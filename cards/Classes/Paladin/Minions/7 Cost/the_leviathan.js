module.exports = {
    name: "The Leviathan",
    stats: [4, 5],
    desc: "&BColossal +1. Rush, Divine Shield&R. After this attacks, &BDredge&R.",
    mana: 7,
    type: "Minion",
    tribe: "Mech",
    class: "Paladin",
    rarity: "Legendary",
    set: "Voyage to the Sunken City",
    keywords: ["Rush", "Divine Shield"],
    colossal: ["", "The Leviathan Claw"],
    id: 269,

    onattack(plr, game, self) {
        game.interact.dredge();
    }
}
