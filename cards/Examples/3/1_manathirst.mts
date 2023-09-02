// Created by Hand

import { Card } from "../../../src/card.js";
import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Manathirst Example",
    stats: [1, 2],
    desc: "Battlecry: Freeze an enemy minion. Manathirst (6): Silence it first.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 51,

    battlecry(plr, game, self) {
        // `ret` is a boolean.
        let ret = self.manathirst(6);

        // Builld the prompt.
        let prompt: string;
        if (ret) prompt = "Silence then freeze an enemy minion.";
        else prompt = "Freeze an enemy minion.";

        // Select a target to freeze (and silence)
        // The first argument is the prompt to ask the user.
        // The second argument is this card (aka `self`).
        // The third argument is the alignment of the target the user is restricted to. If this is "enemy", the user can only select enemy targets, if this is "friendly", the user can only select friendly targets, if this is "any", the user can select any target.
        // The fourth argument is the type of target. If this is "minion", the user can only select minions, if this is "hero", the user can only select heroes, if this is "any", the user can select any type of target.
        // The third and fourth argument works together.
        //
        // Ask the user to select a target based on the `prompt`, the user can only select enemy minions
        let target = game.interact.selectCardTarget(prompt, self, "enemy");

        // If the user cancelled their selection, if you return this, the game refunds the card.
        if (!target) return game.constants.REFUND;

        // If the manathirst was successful, silence the target first
        if (ret) target.silence();

        // Freeze the target
        target.freeze();

        // Return true since otherwise, typescript will complain about the function not returning a value in all branches
        return true;
    },

    condition(plr, game, self) { // This is optional, you will learn more about it in the `condition` example.
        // Since we didn't put the `conditioned: ["battlecry"]` at the top, it won't cancel the battlecry if this returns false, this is just to warn the user that the manathirst isn't triggered.
        return self.manathirst(6);
    }
}

export default blueprint;
