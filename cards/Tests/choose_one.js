module.exports = {
    name: "Choose One Test",
    desc: "Choose One - Gain 1 Mana Crystal this turn only; or Draw a Card.",
    mana: 0,
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    uncollectible: true,

    cast(plr, game) {
        var choice = game.functions.chooseOne('Gain 1 Mana Crystal this turn only; or Draw a Card.', ['1 Mana', 'Draw']);
        if (choice == 0) plr.mana++;
        else plr.drawCard();
    }
}