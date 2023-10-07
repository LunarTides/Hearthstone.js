// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Manathirst Example",
    stats: [1, 2],
    text: "<b>Battlecry:</b> Freeze an enemy minion. Manathirst (6): Silence it first.",
    cost: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 50,

    battlecry(plr, self) {
        // `ret` is a boolean.
        const ret = self.manathirst(6);

        // Build the prompt.
        let prompt: string;
        if (ret) prompt = "Silence then freeze an enemy minion.";
        else prompt = "Freeze an enemy minion.";

        // Select a target to freeze (and silence)
        // The first argument is the prompt to ask the user.
        // The second argument is this card (aka `self`).
        // The third argument is the alignment of the target the user is restricted to. If this is "enemy", the user can only select enemy targets, if this is "friendly", the user can only select friendly targets, if this is "any", the user can select any target.
        //
        // Ask the user to select a target based on the `prompt`, the user can only select enemy minions
        const target = game.interact.selectCardTarget(prompt, self, "enemy");

        // If target is false it means that the user cancelled their selection. Return `game.constants.REFUND` to refund the card.
        if (!target) return game.constants.REFUND;

        // If the manathirst was successful, silence the target first
        if (ret) target.silence();

        // Freeze the target
        target.freeze();

        // Return true since otherwise, typescript will complain about the function not returning a value in all branches
        return true;
    },

    // This is optional, you will learn more about it in the `condition` example in `3-3`.
    condition(plr, self) {
        // The next comment will only make sense after reading the `condition` example. Come back here after reading that.
        // Since we didn't put the `conditioned: ["battlecry"]` at the top, it won't cancel the battlecry if this returns false, this is just to warn the user that the manathirst isn't triggered.
        return self.manathirst(6);
    },

    test(plr, self) {
        const assert = game.functions.util.assert;

        const sheep = new game.Card("Sheep", plr.getOpponent());
        sheep.addStats(4, 4);
        game.summonMinion(sheep, plr.getOpponent());

        assert(() => sheep.getAttack() == 5);
        assert(() => sheep.getHealth() == 5);
        assert(() => !sheep.hasKeyword("Frozen"));

        plr.emptyMana = 1;
        assert(() => plr.emptyMana == 1);
        plr.inputQueue = ["1"];
        self.activate("battlecry");

        assert(() => sheep.hasKeyword("Frozen"));
        sheep.remKeyword("Frozen");
        assert(() => !sheep.hasKeyword("Frozen"));

        plr.emptyMana = 6;
        plr.inputQueue = ["1"];
        self.activate("battlecry");

        assert(() => sheep.hasKeyword("Frozen"));
        assert(() => sheep.getAttack() == 1);
        assert(() => sheep.getHealth() == 1);
    }
}
