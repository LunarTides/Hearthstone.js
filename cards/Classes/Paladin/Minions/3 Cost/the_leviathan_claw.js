module.exports = {
    name: "The Leviathan Claw",
    displayName: "The Leviathan's Claw",
    stats: [4, 2],
    desc: "&BRush, Divine Shield.&R After this attacks, draw a card.",
    mana: 3,
    type: "Minion",
    tribe: "Mech",
    class: "Paladin",
    rarity: "Free",
    set: "Voyage to the Sunken City",
    keywords: ["Rush", "Divine Shield"],
    uncollectible: true,

    passive(plr, game, self, key, val) {
        if (key != "Attack") return;

        const [attacker, target] = val;
        if (attacker != self) return;
        
        plr.drawCard();
    }
}
