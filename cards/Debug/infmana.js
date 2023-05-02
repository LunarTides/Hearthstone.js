module.exports = {
    name: "Inf Mana",
    desc: "Set your mana to 10. For the rest of the game, your mana never decreases.",
    mana: 0,
    type: "Spell",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    cast(plr, game, self) {
        game.functions.addEventListener("", true, () => {
            plr.gainMana(1000, true);
        }, -1);
    }
}