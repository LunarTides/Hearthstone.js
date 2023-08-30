// Created by Hand

/**
 * @type {import("../../../src/types").Blueprint}
 */
module.exports = {
    name: "Battlecry Example",
    stats: [1, 2],
    desc: "&BBattlecry:&R Give this minion +1/+1.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    class: "Neutral",
    rarity: "Free",
    uncollectible: true,

    /**
     * This gives you code-completion for the plr, game, and self arguments if you're using Visual Studio Code.
     * This will automatically show up if you created this card using the card creator or any of it's variants (Custom, Vanilla, Class)
     * @type {import("../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) { // Instead of `battlecry`, you could put `deathrattle`, or `inspire`, for example.
        // The `plr` variable is the card's owner. This is an instance of the Player class as defined in `src/player.ts`.
        // The `game` variable is the current game. This is an instance of the Game class as defined in `src/game.ts`.
        // The `self` variable is the card itself. This is an instance of the Card class as defined in `src/card.ts`.

        // The card class has the `addStats` function that takes in an attack and health, then adds that to the current stats.
        self.addStats(1, 1);
    }
}
