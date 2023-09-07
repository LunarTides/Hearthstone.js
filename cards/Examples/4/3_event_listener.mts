// Created by Hand

import { Blueprint, EventValue } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Event Listener Example",
    stats: [1, 1],
    desc: "Battlecry: For the rest of the game, your battlecries trigger twice.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 57,

    battlecry(plr, game, self) {
        // Add an event listener.
        // The first argument is the key to listen for.
        // The second argument is a function.
        // The thirst argument is another function.
        // The fourth argument is the event listeners' lifespan.
        let destroy = game.functions.addEventListener("PlayCard", _unknownVal => {
            // This function will be run if the correct event was broadcast
            // It will only continue if this function returns true
            // You can also just put `true` instead of this function. That is the same as doing `() => {return true}`

            // This is here to only continue under certain conditions.
            // Think of this like the passive's if statement.
            // Where in passive you would do something like:
            // `if (key !== "PlayCard" || val.type !== "Minion" | val === self) return;
            // Which is a bit confusing, so here you do the opposite (the `key === "PlayCard"` is not needed, as this function only runs if the correct event was broadcast).:
            // `return val.type === "Minion" && val !== self`

            // addEventListener can't figure out the type of `val` by itself, so we have to do the same thing as with passives
            const val = _unknownVal as EventValue<"PlayCard">;

            return val.type == "Minion" && val != self;
        }, (_unknownVal) => {
            // This is the main callback function.

            // The code in here behaves the same as the code after the if statement in passives.

            // This will happen if the correct key was broadcast AND the above function returned true.
            const val = _unknownVal as EventValue<"PlayCard">;

            val.activateBattlecry();

            // You have to return a message to the event listener handler to tell it what to do next.
            // If you return "destroy", the event listener gets destroyed (this is the same as running the `destroy` function).
            // If you return "cancel", this event does not count towards the event listener's lifetime.
            // If you return "reset", the event listener's lifetime is reset to 1, resetting the event listener's age. This is rarely useful, but is an option.
            // If you return true, nothing happens. Do this if nothing special needs to happen.

            return true;
        }, -1); // This number is how many times the main callback function can run before the event listener self-destructs. If this is set to `-1`, it lasts forever.

        // destroy(); // Run this function to destroy the event listener
    }
}
