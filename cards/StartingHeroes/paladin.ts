// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Paladin Starting Hero",
    displayName: "Uther Lightbringer",
    text: "Paladin starting hero",
    cost: 0,
    type: "Hero",
    hpText: "Summon a 1/1 Silver Hand Recruit",
    hpCost: 2,
    classes: ["Paladin"],
    rarity: "Free",
    uncollectible: true,
    id: 10,

    heropower(plr, self) {
        // Summon a 1/1 Silver Hand Recruit.

        // Create the Silver Hand Recruit card.
        const card = new game.Card("Silver Hand Recruit", plr);

        // Summon the card
        game.summonMinion(card, plr);
    },

    test(plr, self) {
        const assert = game.functions.util.assert;

        const checkIfMinionExists = () => {
            return game.board[plr.id].some(card => card.name === "Silver Hand Recruit");
        }

        // The minion should not exist
        assert(() => !checkIfMinionExists());
        self.activate("heropower");

        // The minion should now exist
        assert(checkIfMinionExists);
    }
}
