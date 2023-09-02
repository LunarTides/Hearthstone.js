// Created by the Custom Card Creator

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Priest Starting Hero",
    displayName: "Anduin Wrynn",
    desc: "Priest starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Priest"],
    rarity: "Free",
    hpDesc: "Restore 2 Health.",
    uncollectible: true,
    id: 8,

    heropower(plr, game, self) {
        game.suppressedEvents.push("CastSpellOnMinion");
        let target = game.interact.selectTarget("Restore 2 health.", self, null, null, ["force_elusive"]);
        game.suppressedEvents.pop();

        if (!target) return -1;

        target.addHealth(2, true);
        return true;
    }
}

export default blueprint;
