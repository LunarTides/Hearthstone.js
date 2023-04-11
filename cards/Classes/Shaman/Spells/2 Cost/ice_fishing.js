module.exports = {
    name: "Ice Fishing",
    desc: "Draw 2 Murlocs from your deck.",
    mana: 2,
    class: "Shaman",
    rarity: "Common",
    spellClass: "Frost",
    id: 307,

    cast(plr, game, self) {
        const doDraw = () => {
            let list = plr.deck.filter(c => c.type == "Minion" && game.functions.matchTribe(c.tribe, "Murloc"));
            let minion = game.functions.randList(list, false);
            if (!minion) return;

            plr.drawSpecific(minion);
        }

        for (let i = 0; i < 2; i++) doDraw();
    }
}
