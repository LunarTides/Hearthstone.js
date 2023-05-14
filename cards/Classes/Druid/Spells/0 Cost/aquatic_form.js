module.exports = {
    name: "Aquatic Form",
    desc: "Dredge. If you have the Mana to play the card this turn, draw it.",
    mana: 0,
    type: "Spell",
    class: "Druid",
    rarity: "Rare",
    set: "Voyage to the Sunken City",
    id: 9,

    cast(plr, game, card) {
        let c = game.interact.dredge();

        if (plr.mana >= c.mana) {
            plr.drawCard();
        }
    }
}
