module.exports = {
    name: "Preparation",
    desc: "The next spell you cast this turn costs (2) less.",
    mana: 0,
    class: "Rogue",
    rarity: "Epic",
    set: "Legacy",
    id: 272,

    cast(plr, game, self) {
        let spells = [];
        let stop = false;

        const doDiscount = () => {
            if (stop) return true;

            plr.hand.filter(c => c.type == "Spell").forEach(s => {
                // I use __ids since the cost will change and therefore the card in spells will not be
                // equal to `s`
                if (spells.map(c => c[0].__ids).includes(s.__ids)) {
                    let index = spells.map(c => c[0].__ids).indexOf(s.__ids);

                    if (spells[index][1] != s.mana) spells[index] = [s, s.mana];

                    return;
                }

                s.mana -= 2;
                if (s.mana < 0) s.mana = 0;

                spells.push([s, s.mana]);
            });
        }

        const undo = () => {
            if (stop) return true;

            stop = true;

            spells.forEach(c => {
                let [spells, cost] = c;

                spells.mana = cost + 2;
            });

            return true;
        }

        doDiscount();

        game.functions.addPassive("", () => {return true}, doDiscount, -1);

        game.functions.addPassive("turnEnds", () => {return true}, undo, 1);
        game.functions.addPassive("cardsPlayed", (val) => {
            return val.type == "Spell" && val != self;
        }, undo, 1);
    }
}
