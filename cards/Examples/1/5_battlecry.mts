// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Battlecry Example",
    stats: [1, 2],
    desc: "&BBattlecry:&R Give this minion +1/+1.",
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 33,

    // Here we put the name of the ability we want to add.
    // The card creator should be able to automatically add the correct ability.
    // But so far, it can only add a single ability per card, so if you want to add multiple abilities, you'll have to do it manually.
    // 
    // Instead of `battlecry`, you could put `deathrattle`, or `inspire`, for example.
    battlecry(plr, game, self) {
        // The `plr` variable is the card's owner. This is an instance of the Player class as defined in `src/player.ts`.
        // The `game` variable is the current game. This is an instance of the Game class as defined in `src/game.ts`.
        // The `self` variable is the actual card itself in-game. This is an instance of the Card class as defined in `src/card.ts`.

        // The card class has the `addStats` function that takes in an attack and health, then adds that to the current stats.
        self.addStats(1, 1);
    }
}

export default blueprint;
