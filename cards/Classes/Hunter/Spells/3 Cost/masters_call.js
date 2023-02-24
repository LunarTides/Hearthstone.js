module.exports = {
    name: "Masters Call",
    displayName: "Master's Call",
    desc: "Draw 3 Beasts from your deck.",
    mana: 3,
    class: "Hunter",
    rarity: "Epic",
    set: "Rastakhan's Rumble",
    id: 229,

    cast(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Minion" && c.tribe.includes("Beast"));
        
        let amount = 3;

        if (list.length < amount) amount = list.length;

        for (let i = 0; i < amount; i++) {
            let minion = game.functions.randList(list, false);
            if (!minion) continue;

            plr.drawSpecific(minion);
        }
    }
}
