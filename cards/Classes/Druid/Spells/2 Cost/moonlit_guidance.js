module.exports = {
    name: "Moonlit Guidance",
    desc: "Discover a copy of a card in your deck. If you play it this turn, draw the original.",
    mana: 2,
    class: "Druid",
    rarity: "Rare",
    set: "United in Stormwind",
    spellClass: "Arcane",
    id: 146,

    cast(plr, game, self) {
        let cards = plr.deck;
        let card = game.interact.discover("Discover a copy of a card in your deck.", cards);

        let desc = card.desc;
        let turnText = "";

        if (card.desc) turnText += " (";
        turnText += "If you play this minion this turn, draw the original";
        if (card.desc) turnText += ")"
        turnText = turnText.gray;

        card.desc += turnText;

        let cardsPlayedPassiveIndex = game.passives.push((game, key, val) => {
            if (key != "cardsPlayed") return;
            if (val != card) return;

            let ogCard = cards.filter(c => c.name == card.name);
            if (ogCard.length <= 0) return;
            console.log(ogCard);

            ogCard = ogCard[0];

            plr.drawSpecific(ogCard);
        });

        let endTurnPassiveIndex = game.passives.push((game, key, val) => {
            if (key != "turnEnds") return;

            card.desc = desc;

            game.passives.splice(cardsPlayedPassiveIndex - 1, 1);
            game.passives.splice(endTurnPassiveIndex - 1, 1);
        });
    }
}
