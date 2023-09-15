// Created by the Custom Card Creator

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Hi",
    stats: [1, 1],
    desc: "<b>Hi:</b> Deal 3 damage to your hero.",
    mana: 1,
    type: "Test",
    classes: ["Neutral"],
    rarity: "Rare",
    test: 5,
    id: 67,
    
    hi(plr, game, self) {
        // Deal 3 damage to your hero.
        game.attack(3, plr);
    }
}
