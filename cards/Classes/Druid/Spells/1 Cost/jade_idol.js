module.exports = {
    name: "Jade Idol",
    desc: "Choose One - Summon a Jade Golem; or Shuffle 3 copies of this card into your deck.",
    mana: 1,
    class: "Druid",
    rarity: "Rare",
    set: "Mean Streets of Gadgetzan",

    cast(plr, game, card) {
        var choice = game.functions.chooseOne('Summon a Jade Golem; or Shuffle 3 copies of this card into your deck.', ['Jade Golem', 'Shuffle']);
        
        if (choice == 0) {
            let jade = game.functions.createJade(plr);

            game.playMinion(jade, plr);
        } else {
            for (let i = 0; i < 3; i++) {
                plr.shuffleIntoDeck(new game.Spell("Jade Idol", plr));
            }
        }
    }
}