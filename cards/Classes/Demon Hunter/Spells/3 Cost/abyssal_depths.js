module.exports = {
    name: "Abyssal Depths",
    desc: "Draw your two lowest Cost minions.",
    mana: 3,
    type: "Spell",
    class: "Demon Hunter",
    rarity: "Common",
    set: "Voyage to the Sunken City",
    spellClass: "Shadow",
    id: 202,

    cast(plr, game, self) {
        const doDraw = () => {
            let list = plr.deck.filter(c => c.type == "Minion");

            let lowestCost = game.functions.randList(list, false);
            if (!lowestCost) return;

            list.forEach(m => {
                if (m.mana < lowestCost.mana) lowestCost = m;
            });

            plr.drawSpecific(lowestCost);
        }

        doDraw();
        doDraw();
    }
}
