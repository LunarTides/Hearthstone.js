// Created by Hand

import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Location Example",
    stats: [1, 3], // The attack is set to 0 when you play the card. The health is now the amount of times you can trigger the location card before breaking.
    desc: "Restore 2 health to your hero.",
    mana: 1,
    type: "Location",
    classes: ["Neutral"],
    rarity: "Free",
    cooldown: 2, // How many turns you have to wait until you can use the location card again. Afaik, in hearthstone, this is always 2.
    uncollectible: true,
    id: 37,

    use(plr, game, self) {
        plr.addHealth(2); // Heal this card's owner by 2.
    }
}

export default blueprint;
