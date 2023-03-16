module.exports = {
    name: "Academic Espionage",
    desc: "Shuffle 10 cards from your opponent's class into your deck. They cost (1).",
    mana: 4,
    class: "Rogue",
    rarity: "Epic",
    set: "The Boomsday Project",
    id: 282,

    cast(plr, game, self) {
        let list = Object.values(game.functions.getCards());
        list = list.filter(c => c.class == plr.getOpponent().heroClass);
        if (list.length <= 0) return;
        
        const doShuffle = () => {
            let card = game.functions.randList(list);
            card = new game.Card(card.name, plr);

            card.mana = 1;

            plr.shuffleIntoDeck(card);
        }

        for (let i = 0; i < 10; i++) doShuffle();
    }
}
