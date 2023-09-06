// Created by Hand

// You shouldn't touch anything outside of the blueprint object.
import { Blueprint } from "../../../src/types.js";

const blueprint: Blueprint = {
    // The name of the card. It MUST be unique.
    // If the card has a common name like `Plant`, then use a display name.
    // More on this in `2-7`.
    name: "Minion Example",

    // The stats. The first number is its attack, and the second number is its health.
    stats: [2, 1],

    // The description of the card. This can be anything.
    desc: "Just an example card (Does nothing)",

    // How much the card costs.
    mana: 1,

    // What type the card is: "Minion", "Spell", "Weapon", etc...
    type: "Minion",

    // What tribe the minion is: "Undead", "Naga", "Beast", etc...
    tribe: "None",

    // What classes that the card belongs to: "Neutral", "Warrior", "Hunter", etc...
    classes: ["Neutral"],

    // The rarity of the card: "Free", "Common", "Rare", etc...
    rarity: "Free",

    // If the card should not be allowed in decks, or in card pools.
    // These example cards should not be randomly generated in `discover`, or added in a deck, so all of them are uncollectible.
    uncollectible: true,

    // The ID of the card. This is used in deckcodes, and should be unique per blueprint. This gets generated automatically by the card creator.
    // If you have debug mode enabled, you can type `/give (id)` to give yourself the card with that id.
    id: 29,
}

export default blueprint;
