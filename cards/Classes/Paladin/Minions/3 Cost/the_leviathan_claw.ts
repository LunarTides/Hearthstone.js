// Created by the Custom Card Creator

import { Blueprint, EventValue } from "../../../../../src/types";

const blueprint: Blueprint = {
    name: "The Leviathan Claw",
    displayName: "The Leviathan's Claw",
    stats: [4, 2],
    desc: "&BRush, Divine Shield.&R After this attacks, draw a card.",
    mana: 3,
    type: "Minion",
    tribe: "Mech",
    class: "Paladin",
    rarity: "Free",
    keywords: ["Rush", "Divine Shield"],
    uncollectible: true,

    passive(plr, game, self, key, _unknownValue) {
        // Rush, Divine Shield. After this attacks, draw a card.

        // If the key is for a different event, stop the function.
        if (key != "Attack") return;

        // Here we cast the value to the correct type.
        // Do not use the '_unknownValue' variable after this.
        const val = _unknownValue as EventValue<typeof key>;

        const [attacker, target] = val;
        if (attacker != self) return;
        
        plr.drawCard();
    }
}

export default blueprint;
