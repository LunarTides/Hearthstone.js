module.exports = {
    name: "10 Mana",
    desc: "Set your mana to 10.",
    mana: 0,
    type: "Spell",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    cast(plr, game, self) {
        plr.gainMana(10, true);
    }
}