module.exports = {
    name: "Taunt Example",
    stats: [2, 3],
    desc: "&BTaunt.&R This is an example card to show how to add keywords to cards.", // The description doesn't really matter, but it's nice to explain what the card does. The `&B` means Bold, and the `&R` means Reset. This just makes the word `Taunt.` bold, but nothing after it.
    mana: 1,
    tribe: "Beast",
    class: "Neutral",
    rarity: "Free",
    keywords: ["Taunt"], // This is an array of keywords. You could also do `keywords: ["Taunt", "Divine Shield"]` to also give the card divine shield, for example.
    uncollectible: true
}
