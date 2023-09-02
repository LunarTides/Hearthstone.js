// Created by Hand

import { Blueprint, EventValue } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Event Listener Example",
    stats: [1, 1],
    desc: "Battlecry: For the rest of the game, your battlecries trigger twice.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 58,

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

            // addEventListener can't figure out the type of `val` by itself, so we have to do the same thing as with passives
            const val = _unknownVal as EventValue<"PlayCard">;

            return val.type == "Minion" && val != self;
        }, (_unknownVal) => {
            // This will happen if the correct key was broadcast AND the above function returned true.
            // If THIS function returns true, the event listener self-destructs.
            const val = _unknownVal as EventValue<"PlayCard">;

            val.activateBattlecry();
        }, -1); // This number is how many times the `val.activateBattlecry()` function can run before the event listener self-destructs. If this is set to `-1`, it lasts forever.

        // destroy(); // Run this function to destroy the event listener
    }
}

export default blueprint;
