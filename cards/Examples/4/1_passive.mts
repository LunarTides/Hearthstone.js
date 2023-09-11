// Created by Hand

import { Blueprint, EventValue } from "@Game/types.js";

// Im sorry, things are about to become a lot more complicated from this point on.
export const blueprint: Blueprint = {
    name: "Passive Example",
    stats: [1, 1],

    // This is our goal, remember that after this massive info-dump.
    desc: "Your battlecries trigger twice.",

    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 55,

    // Note the new `key` and `_unknownVal` arguments.
    // These are only used in the `passive` and `handpassive` abilities.
    passive(plr, game, self, key, _unknownVal) {
        // Your battlecries trigger twice.
        // ^ In order to do this, we wait until a minion is played, then manually trigger its battlecry.

        // Passive is kinda like a mini event listener. (More on that in `4-3`)
        // The passive lasts as long as the minion is on the board. Use `handpassive` instead for the passive to last as long as the minion is in a hand.
        // Whenever an event gets broadcast, this passive will be triggered with the key and value of that event.
        // The card can then choose to only do something if the correct event was broadcast. (By looking at the `key` of the event.)

        // `key` is the key of the event. Look in `src/types.ts` `EventKey` type for all keys.
        // `_unknownVal` is some additional information about the event. The type of this variable is different for each `key`, which is why it's unknown.
        // We will narrow the type of `_unknownVal` once we know what `key` is.
        //
        // We want to execute code when a card gets played. There exists a event with the key `PlayCard`.
        // That event's value is the card played (type `Card`).

        // When you play a minion, the `PlayCard` event is triggered after the minion's battlecry,
        // in order for refunding to not trigger the event, so we can trigger the minion's battlecry again.
        // We don't refund here, since refunding from passives is not supported, and currently doesn't do anything.
        // But if i add refunding from passives, it would probably break the card in some way, so just wait until it is supported, and you know what it does before using it.
        if (!(key === "PlayCard")) return;

        // Since we now know that the key is `PlayCard`, we can retrieve the correct value by doing this.
        const val = _unknownVal as EventValue<typeof key>;

        // `val` is now the correct type for that key (in this case `Card`)
        // If i change the event's value in the future, this will correctly cause an error instead of unexpected behavior.

        // We check if the card played is not a minion
        if (val.type !== "Minion") return;

        // We now now that a `PlayCard` event triggered, and the card played was a minion.

        // Activate the battlecry of the minion.
        // Remember, this passive triggers after the minion's battlecry (in order to handle refunding).
        // This means that once we trigger the battlecry here, the minion's battlecry will have triggered twice in total.
        val.activateBattlecry();
    }
}
