// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Inf Mana",
    text: "Fill up your mana. For the rest of the game, your mana never decreases.",
    cost: 0,
    type: "Spell",
    spellSchool: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 66,

    cast(plr, self) {
        // Fill up your mana. For the rest of the game, your mana never decreases.

        // Gain max mana every tick.
        // This lasts for the rest of the game, since we don't unhook it.
        game.functions.event.hookToTick(() => {
            plr.gainMana(plr.maxMana);
        });
    },

    test(plr, self) {
        const assert = game.functions.util.assert;

        plr.mana = 5;
        self.activate("cast");

        // The game hasn't ticked yet
        assert(() => plr.mana === 5);

        // Manually tick the game
        game.events.tick("GameLoop", null, plr);

        assert(() => plr.mana === 10);

        // Play a card to verify that the mana doesn't decrease
        const card = new game.Card("Sheep", plr);
        const result = game.playCard(card, plr);

        assert(() => result === true);
        assert(() => plr.mana === 10);
    }
}
