module.exports = {
    name: "Moonlit Guidance",
    desc: "Discover a copy of a card in your deck. If you play it this turn, draw the original.",
    mana: 2,
    type: "Spell",
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

        let remove = game.functions.addEventListener("PlayCard", (val) => {
            return val == card;
        }, () => {
            let ogCard = cards.filter(c => c.name == card.name);
            if (ogCard.length <= 0) return

            ogCard = ogCard[0];

            plr.drawSpecific(ogCard);
        }, 1);

        game.functions.addEventListener("EndTurn", true, () => {
            card.desc = desc;
            remove();
        }, 1);
    }
}
