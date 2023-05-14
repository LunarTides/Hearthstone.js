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

    battlecry(plr, game, self) { // Instead of `battlecry`, you could put `deathrattle`, or `inspire`, for example.
        // The `plr` variable is the card's owner. This is an instance of the Player class as defined in `src/player.js`.
        // The `game` variable is the current game. This is an instance of the Game class as defined in `src/game.js`.
        // The `self` variable is the card itself. This is an instance of the Card class as defined in `src/card.js`.

        // The card class has the `addStats` function that takes in an attack and health, then adds that to the current stats.
        self.addStats(1, 1);
    }
}
