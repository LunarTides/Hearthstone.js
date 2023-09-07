// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "DIY 2",
    desc: "&BThis is a DIY card, it does not work by default.&R Restore 3 health to your hero.",
    mana: 0,
    type: "Spell",
    spellSchool: "None",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 62,

    cast(plr, game, self) {
        // Restore 3 health to the hero.

        // Try to heal the player by 3 hp.

        // This is in a function so i can unit test it
        // This is to make sure you got the right solution, since otherwise it can cause bugs
        
        // Put all your code in this function please
        function solution() {

            












            
        }















        // DON'T CHANGE ANYTHING BELOW THIS LINE

        // Testing your solution.
        let solved = true;

        let trueOgHealth = plr.health;

        // Restore 3 health when the player has 5 less than max health
        plr.health = plr.maxHealth - 5;
        let ogHealth = plr.health;

        solution();

        solved = solved && (plr.health == ogHealth + 3);

        // Restore to max health when the player has 1 less than max health
        plr.health = plr.maxHealth - 1;
        ogHealth = plr.health;

        solution();

        solved = solved && (plr.health == plr.maxHealth);

        plr.health = trueOgHealth;

        game.interact.verifyDIYSolution(solved, "2.mts");

        if (!solved) return game.constants.REFUND;
        return true;
    }
}
