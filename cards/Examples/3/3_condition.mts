// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Condition Example",
    stats: [5, 2],
    desc: "&BBattlecry:&R If your deck has no duplicates, draw a card.", // This is a common condition
    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    conditioned: ["battlecry"], // By having this here, the battlecry function below will only trigger if the condition function returns true
    uncollectible: true,
    id: 53,

    battlecry(plr, game, self) {
        // This will only trigger if the `condition` function below returns true.
        // Makes the card's owner draw a card.
        //
        //if (!self.activate("condition")[0]) return; // If you don't put the `conditioned: ["battlecry"]` at the top, you can use this code to achieve the same thing.
        
        plr.drawCard();
    },

    condition(plr, game, self) {
        // `game.functions.highlander` will return true if the player has no duplicates in their deck.
        //
        //return true; // Uncomment this to see how a fulfilled condition looks like.
        return game.functions.highlander(plr);
    }
}

export default blueprint;
