// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "DIY 1",
    stats: [1, 1],
    desc: "&BThis is a DIY card, it does not work by default. Battlecry:&R Give this minion +1/+1.",
    mana: 0,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 62,

    battlecry(plr, game, self) {
        // Battlecry: Give this minion +1/+1.
        
        // Try to give this minion +1/+1 yourself.
        











        
        // DON'T CHANGE ANYTHING BELOW THIS LINE

        // Testing your solution.
        game.interact.verifyDIYSolution(self.getAttack() == 2 && self.getHealth() == 2, "1.ts");
    }
}

export default blueprint;
