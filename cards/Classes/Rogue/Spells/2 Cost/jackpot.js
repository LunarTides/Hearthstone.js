module.exports = {
    name: "Jackpot",
    displayName: "Jackpot!",
    desc: "Add two random spells from other classes that cost (5) or more to your hand.",
    mana: 2,
    class: "Rogue",
    rarity: "Common",
    set: "Throne of the Tides",
    id: 279,

    cast(plr, game, self) {
        let list = Object.values(game.functions.getCards());
        list = list.filter(c => game.functions.getType(c) == "Spell" && c.mana >= 5 && !game.functions.validateClass(plr, c));
        if (list.length <= 0) return;

        const addSpell = () => {
            let spell = game.functions.randList(list);
            spell = new game.Card(spell.name, plr);

            plr.addToHand(spell);
        }

        for (let i = 0; i < 2; i++) addSpell();
    }
}
