// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Witchy Lackey",
    stats: [1, 1],
    text: "<b>Battlecry:</b> Transform a friendly minion into one that costs (1) more.",
    cost: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 28,

    battlecry(plr, game, self) {
        // Transform a friendly minion into one that costs (1) more.

        // Ask the user which minion to transform
        let target = game.interact.selectCardTarget("Transform a friendly minion into one that costs (1) more.", self, "friendly");

        // If no target was selected, refund
        if (!target) return game.constants.REFUND;

        // There isn't any cards that cost more than 10, so refund
        if (target.cost >= 10) return game.constants.REFUND;

        // Filter minions that cost (1) more than the target
        let minions = game.functions.getCards().filter(card => {
            if (!target) throw new Error("Target is undefined!");

            return card.type === "Minion" && card.cost === target.cost + 1;
        });

        // Choose a random minion from the filtered list.
        let rand = game.lodash.sample(minions);
        if (!rand) return game.constants.REFUND;

        // Create the card
        const card = new game.Card(rand.name, plr);

        // Destroy the target and summon the new minion in order to get the illusion that the card was transformed
        target.destroy();

        // Summon the card to the player's side of the board
        game.summonMinion(card, plr);
        return true;
    },

    test(plr, game, self) {
        const assert = game.functions.assert;

        let existsMinionWithCost = (cost: number) => {
            return game.board[plr.id].some(card => card.cost === cost);
        }

        // Summon a sheep
        let sheep = new game.Card("Sheep", plr);
        game.summonMinion(sheep, plr);

        // There shouldn't exist a minion with 1 more cost than the sheep.
        assert(() => !existsMinionWithCost(sheep.cost + 1));

        // If there doesn't exist any 2-Cost minions, pass the test
        if (!game.functions.getCards().some(card => card.cost === sheep.cost + 1 && card.type === "Minion")) return;

        // Activate the battlecry, select the sheep.
        plr.inputQueue = ["1"];
        self.activateBattlecry();

        // There should now exist a minion with 1 more cost than the sheep.
        assert(() => existsMinionWithCost(sheep.cost + 1));
    }
}
