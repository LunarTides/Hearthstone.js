module.exports = {
    name: "Flesh Behemoth",
    stats: [4, 8],
    desc: "Taunt. Deathrattle: Draw another Undead and summon a copy of it.",
    mana: 9,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Rare",
    set: "March of the Lich King",
    keywords: ["Taunt"],
    id: 132,

    deathrattle(plr, game, self) {
        let cards = plr.deck.filter(c => c.type == "Minion" && c.tribe.includes("Undead"));
        let card = game.functions.randList(cards, false);
        if (!card) return;

        plr.drawSpecific(card);

        let copy = game.functions.cloneCard(card);
        game.summonMinion(copy, plr);
    }
}
