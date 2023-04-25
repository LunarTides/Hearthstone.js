module.exports = {
    name: "Clever Disguise",
    desc: "Add 2 random spells from another class to your hand.",
    mana: 2,
    class: "Rogue",
    rarity: "Common",
    set: "Saviors of Uldum",
    id: 278,

    cast(plr, game, self) {
        let list = game.functions.getCards();
        list = list.filter(c => game.functions.getType(c) == "Spell" && !game.functions.validateClass(plr, c));
        if (list.length <= 0) return;
        
        const addSpell = () => {
            let spell = game.functions.randList(list);
            spell = new game.Card(spell.name, plr);

            plr.addToHand(spell);
        }

        for (let i = 0; i < 2; i++) addSpell();
    }
}
