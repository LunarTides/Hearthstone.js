module.exports = {
    name: "Dun Baldar Bunker",
    desc: "At the end of your turn, draw a Secret and set its Cost to (1). Lasts 3 turns.",
    mana: 2,
    class: "Hunter",
    rarity: "Rare",
    set: "Fractured in Alterac Valley",
    id: 220,

    cast(plr, game, self) {
        game.functions.addPassive("turnEnds", (key, val) => {
            return game.player == plr;
        },
        () => {
            let list = plr.deck.filter(c => c.type == "Spell" && c.desc.startsWith("Secret: "));
            if (!list) return;

            let card = game.functions.randList(list, false);
            if (!card) return;

            card.mana = 1;
            plr.drawSpecific(card);
        }, 3);
    }
}
