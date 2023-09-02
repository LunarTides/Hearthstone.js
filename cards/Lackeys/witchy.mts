// Created by Hand (before the Card Creator Existed)

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Witchy Lackey",
    stats: [1, 1],
    desc: "Battlecry: Transform a friendly minion into one that costs (1) more.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 28,

    battlecry(plr, game, self) {
        let target = game.interact.selectTarget("Transform a friendly minion into one that costs (1) more.", self, "friendly", "minion");
        if (!target || !(target instanceof game.Card) || target.mana >= 10) return -1;

        let minions = game.functions.getCards().filter(card => {
            if (!target) return false;
            return card.type === "Minion" && card.mana === target.mana + 1;
        });
        let rand = game.functions.randList(minions);

        game.summonMinion(new game.Card(rand.name, plr), plr);
        
        target.destroy();
        return true;
    }
}

export default blueprint;
