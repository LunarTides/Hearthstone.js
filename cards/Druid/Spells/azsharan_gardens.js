module.exports = {
    name: "Azsharan Gardens",
    type: "Spell",
    desc: "Give all minions in your hand +1/+1. Put a 'Sunken Gardens' on the bottom of your deck.",
    mana: 1,
    class: "Druid",
    rarity: "Common",
    set: "Voyage to the Sunken City",

    cast(plr, game, card) {
        plr.hand.forEach(c => {
            c.addStats(1, 1);
        });

        plr.deck = [new game.Spell("Sunken Gardens", plr), ...plr.deck];
    }
}