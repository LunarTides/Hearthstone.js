// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Paladin Starting Hero",
    displayName: "Uther Lightbringer",
    desc: "Paladin starting hero",
    cost: 0,
    type: "Hero",
    classes: ["Paladin"],
    rarity: "Free",
    hpDesc: "Summon a 1/1 Silver Hand Recruit.",
    hpCost: 2,
    uncollectible: true,
    id: 10,

    heropower(plr, game, self) {
        // Summon a 1/1 Silver Hand Recruit.

        // Create the Silver Hand Recruit card.
        const card = new game.Card("Silver Hand Recruit", plr);

        // Summon the card
        game.summonMinion(card, plr);
    }
}