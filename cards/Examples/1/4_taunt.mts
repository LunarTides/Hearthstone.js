// Created by Hand

import { Blueprint } from "@Game/types.js";

export const blueprint: Blueprint = {
    name: "Taunt Example",
    stats: [2, 3],

    // The description doesn't really matter, but it's nice to explain what the card does.
    // The `<b>` will bold all characters after it, and the `</b>` stops the bolding. This just makes the word `Taunt.` bold, but nothing after it.
    // You can also use `<bold>` and `</bold>` if you want to be more verbose. Bold is currently the only tag that supports this.
    // Look in `functions.parseTags` for a list of these tags.
    desc: "<b>Taunt.</b> This is an example card to show how to add keywords to cards.",

    mana: 1,
    type: "Minion",
    tribe: "None",
    classes: ["Neutral"],
    rarity: "Free",

    // This is an array of keywords. You could also do `keywords: ["Taunt", "Divine Shield"]` to also give the card divine shield, for example.
    keywords: ["Taunt"],

    uncollectible: true,
    id: 32
}
