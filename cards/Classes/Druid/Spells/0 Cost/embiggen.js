module.exports = {
    name: "Embiggen",
    desc: "Give all minions in your deck +2/+2. They cost (1) more (up to 10).",
    mana: 0,
    class: "Druid",
    rarity: "Epic",
    set: "Descent of Dragons",
    spellClass: "Nature",
    id: 10,

    cast(plr, game, card) {
        let cards = plr.deck.filter(c => c.type === "Minion");

        for (let c of cards) {
            c.addStats(2, 2);

            if (c.mana < 10) {
                c.mana += 1;
            }
        }
    }
}