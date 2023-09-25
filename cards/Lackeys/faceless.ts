// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Faceless Lackey",
    stats: [1, 1],
    desc: "<b>Battlecry:</b> Summon a random 2-Cost minion.",
    cost: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 25,

    battlecry(plr, game, self) {
        // Summon a random 2-Cost minion.

        // filter out all cards that aren't 2-cost minions
        let minions = game.functions.getCards().filter(card => card.type === "Minion" && card.cost === 2);

        // Choose a random minion
        let rand = game.functions.randList(minions)?.actual;
        if (!rand) return;

        // Summon the minion
        let minion = new game.Card(rand.name, plr);
        game.summonMinion(minion, plr);
    },

    test(plr, game, self) {
        const assert = game.functions.assert;

        // If there doesn't exist any 2-Cost minions, pass the test
        if (!game.functions.getCards().some(card => card.cost === 2 && card.type === "Minion")) return;

        let exists2CostMinion = () => {
            return game.board[plr.id].some(card => card.cost === 2);
        }

        // There shouldn't exist any 2-Cost minions right now.
        assert(() => !exists2CostMinion());
        self.activateBattlecry();

        // There should exist a 2-Cost minion now.
        assert(exists2CostMinion);
    }
}
