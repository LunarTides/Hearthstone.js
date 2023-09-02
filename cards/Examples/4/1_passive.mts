// Created by Hand

import { Blueprint, EventValue } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Passive Example",
    stats: [1, 1],

    // Im sorry, things are about to become a lot more complicated from this point on.
    // This is our goal, remember that after this massive info-dump.
    desc: "Your battlecries trigger twice.",

    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 56,

    // Note the new `key` and `_unknownVal` arguments.
    // These are only used in the `passive` and `handpassive` abilities.
    passive(plr, game, self, key, _unknownVal) {
        // Your baatlecries trigger twice.
        // ^ In order to do this, we wait until a minion is played, then manually trigger its battlecry.

        // Passive is kinda like a mini event listener. (More on that in `4-3`)
        // The passive lasts as long as the minion is on the board. Use `handpassive` instead for the passive to last as long as the minion is in a hand.
        // Whenever an event gets broadcast, this passive will be triggered with the key and value of that event.
        // The card can then choose to only do something if the correct event was broadcast. (By looking at the `key` of the event.)

        // `key` is the key of the event. A list of keys is in `events.txt` in the main folder.
        // `_unknownVal` is some additional information about the event. This is different for each `key`, which is why it's unknown.
        // We will narrow what `_unknownVal` once we know what `key` is.
        //
        // We want to execute code when a card gets played. There exists a event with the key `PlayCard`.
        // That event's value is the card played (type `Card`).

        // When you play a minion, the `PlayCard` event is triggered after the minion's battlecry,
        // in order for refunding to not trigger the event, so we can trigger the minion's battlecry again.
        if (key !== "PlayCard") return;

        // Since we now know that the key is `PlayCard`, we can retrieve the correct value by doing this.
        // `val` is now the correct type for that key (in this case `Card`)
        // If i change the event's value in the future, this will correctly cause an error instead of unexpected behavior.
        const val = _unknownVal as EventValue<typeof key>;

        // We check if the card played is not a minion
        if (val.type !== "Minion") return;

        // We now now that a `PlayCard` event triggered, and the card played was a minion.

        // Activate the battlecry of the minion.
        // Remember, this passive triggers after the minion's battlecry (in order to handle refunding).
        // This means that once we trigger the battlecry here, the minion's battlecry will have triggered twice in total.
        val.activateBattlecry();
    }
}

export default blueprint;
