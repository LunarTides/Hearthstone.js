// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Faceless Lackey",
    stats: [1, 1],
    desc: "Battlecry: Summon a random 2-Cost minion.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 25,

    battlecry(plr, game, self) {
        // filter out all cards that aren't 2-cost minions
        let minions = game.functions.getCards().filter(card => card.type === "Minion" && card.mana === 2);
        let rand = game.functions.randList(minions);
        if (!rand) return;

        game.summonMinion(new game.Card(rand.name, plr), plr);
    }
}

export default blueprint;
