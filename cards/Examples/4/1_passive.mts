// Created by Hand

import { Blueprint, EventValue } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Passive Example",
    stats: [1, 1],
    desc: "Your battlecries trigger twice.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 56,

    passive(plr, game, self, key, _unknownVal) {
        // Passive is kinda like a mini event listener.
        // The passive lasts as long as the minion is on the board. Use `handpassive` instead for the passive to last as long as the minion is in a hand.

        // `key` is the key of the event. A list of keys is in `events.txt` in the main folder.
        // `_unknownVal` is some additional information about the event. This is different for each `key`, which is why it's unknown.
        //
        // We are looking for the `PlayCard` key.
        // The `PlayCard` key's `val` is the card played.
        //
        // When you play a minion, the `PlayCard` event is triggered after the minion's battlecry, in order for refunding to not trigger the event, so we can trigger the minion's battlecry again.
        if (key != "PlayCard") return;

        // Since we now know that the key is `PlayCard`, we can retrieve the value by doing this. `val` is now the correct value for that key (in this case `Card`)
        // If the key's value gets changed in the future, this will correctly crash instead of causing unexpected behavior.
        const val = _unknownVal as EventValue<typeof key>;

        if (val.type != "Minion") return; // We check if the card played is not a minion

        // We now now that a `PlayCard` event triggered, and the card played was a minion.
        val.activateBattlecry(); // Activate the battlecry of the minion.
    }
}

export default blueprint;
