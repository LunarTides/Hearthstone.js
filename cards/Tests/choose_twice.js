module.exports = {
    name: "Choose Twice Test",
    type: "Spell",
    desc: "Choose Twice - Gain 1 Mana Crystal this turn only; or Draw a Card.",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Legacy",

    cast(plr, game) {
        chooseOne('Gain 1 Mana Crystal this turn only; or Draw a Card.', ['1 Mana', 'Draw'], 2).forEach(c => {
            if (c == 0) {plr.mana++}
            else {plr.drawCard()}
        });
    }
}