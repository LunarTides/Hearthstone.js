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

    passive(plr, game, self, key, val) {
        if (key != "Attack") return;
        val = val as EventValue<typeof key>;

        const [attacker, target] = val;
        if (attacker != self) return;
        
        plr.drawCard();
    }
}

export default blueprint