// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Ethereal Lackey",
    stats: [1, 1],
    desc: "Battlecry: Discover a spell.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 24,

    battlecry(plr, game) {
        let list = game.functions.getCards();
        list = list.filter(c => c.type == "Spell");
        if (list.length <= 0) return;

        let card = game.interact.discover("Discover a spell.", list);
        if (!card) return -1;

        plr.addToHand(card);
        return true;
    }
}

export default blueprint;
