// Created by Hand

/**
 * @type {import("../../../src/types").Blueprint}
 */
module.exports = {
    name: "Event Listener Example",
    stats: [1, 1],
    desc: "Battlecry: For the rest of the game, your battlecries trigger twice.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    /**
     * @type {import("../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        // Add an event listener.
        // The first argument is the key to listen for.
        // The second argument is a function.
        // The thirst argument is another function.
        // The fourth argument is the event listeners' lifespan.
        let destroy = game.functions.addEventListener("PlayCard", val => {
            // This function will be run if the correct event was broadcast
            // It will only continue if this function returns true
            // You can also just put `true` instead of this function. That is the same as doing `() => {return true}`
            return val.type == "Minion" && val != self;
        }, (val) => {
            // This will happen if the correct key was broadcast AND the above function returned true.
            // If THIS function returns true, the event listener self-destructs.
            val.activateBattlecry();
        }, -1); // This number is how many times the `val.activateBattlecry()` function can run before the event listener self-destructs. If this is set to `-1`, it lasts forever.

        // destroy(); // Run this function to destroy the event listener
    }
}
