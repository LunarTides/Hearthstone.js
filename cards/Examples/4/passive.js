// Created by Hand

/**
 * @type {import("../../../src/types").Blueprint}
 */
module.exports = {
    name: "Passive Example",
    stats: [1, 1],
    desc: "Your battlecries trigger twice.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    /**
     * @type {import("../../../src/types").KeywordMethod}
     */
    passive(plr, game, self, key, val) {
        // Passive is kinda like a mini event listener.
        // The passive lasts as long as the minion is on the board. Use `handpassive` instead for the passive to last as long as the minion is in a hand.

        // `key` is the key of the event. A list of keys is in `events.txt` in the main folder.
        // `val` is some additional information about the event. `val` is different for each `key`. Look in `events.txt` for the values for a key.
        //
        // We are looking for the `PlayCard` key.
        // The `PlayCard` key's `val` is the card played.
        //
        // When you play a minion, the `PlayCard` event is triggered after the minion's battlecry, in order for refunding to not trigger the event, so we can trigger the minion's battlecry again.
        if (key != "PlayCard") return;
        if (val.type != "Minion") return; // We check if the card played is not a minion

        // We now now that a `PlayCard` event triggered, and the card played was a minion.
        val.activateBattlecry(); // Activate the battlecry of the minion.
    }
}
