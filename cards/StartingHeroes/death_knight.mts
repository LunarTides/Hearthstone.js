// Created by the Custom Card Creator

import { Blueprint } from "../../src/types.js";

const blueprint: Blueprint = {
    name: "Death Knight Starting Hero",
    displayName: "The Lich King",
    desc: "Death knight starting hero",
    mana: 0,
    type: "Hero",
    classes: ["Death Knight"],
    rarity: "Free",
    hpDesc: "Summon a 1/1 Ghoul with Charge. It dies at end of turn.",
    uncollectible: true,
    id: 14,

    heropower(plr, game, self) {
        // Summon a 1/1 Ghoul with Charge. It dies at end of turn.

        // Create the Ghoul
        let minion = new game.Card("Death Knight Frail Ghoul", plr);

        // Summon the Ghoul
        game.summonMinion(minion, plr);

        // The `It dies at end of turn.` part is handled by the ghoul itself, so we don't need to do anything extra here
    }
}

export default blueprint;
