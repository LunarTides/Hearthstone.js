// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Flipper Friends",
    desc: "Choose One - Summon a 6/6 Orca with Taunt; or six 1/1 Otters with Rush.",
    mana: 5,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "Voyage to the Sunken City",
    spellClass: "Nature",
    id: 155,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        let choice = game.interact.chooseOne("Summon a 6/6 Orca with Taunt; or six 1/1 Otters with Rush", ["Orca", "Otter"]);
        let name = choice == 0 ? "Orca" : "Otter";
        let times = choice == 0 ? 1 : 6;
        name = "Flipper Friends " + name;

        for (let i = 0; i < times; i++) {
            let copy = new game.Card(name, plr);

            game.summonMinion(copy, plr);
        }
    }
}
