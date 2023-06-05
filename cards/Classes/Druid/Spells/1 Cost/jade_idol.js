// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Jade Idol",
    desc: "Choose One - Summon a Jade Golem; or Shuffle 3 copies of this card into your deck.",
    mana: 1,
    type: "Spell",
    class: "Druid",
    rarity: "Rare",
    set: "Mean Streets of Gadgetzan",
    id: 18,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, card) {
        let choice = game.interact.chooseOne('Summon a Jade Golem; or Shuffle 3 copies of this card into your deck.', ['Jade Golem', 'Shuffle']);
        
        if (choice == 0) {
            let jade = game.functions.createJade(plr);

            game.summonMinion(jade, plr);
        } else {
            for (let i = 0; i < 3; i++) {
                plr.shuffleIntoDeck(new game.Card("Jade Idol", plr));
            }
        }
    }
}
