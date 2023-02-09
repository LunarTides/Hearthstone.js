module.exports = {
    name: "Blademaster Okani",
    stats: [2, 6],
    desc: "Battlecry: Secretly choose to Counter the next minion or spell your opponent plays while this is alive.",
    mana: 4,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Voyage to the Sunken City",
    id: 151,

    battlecry(plr, game, self) {
        let choice = game.interact.chooseOne("Counter the next Minion your opponent plays; or Counter the next Spell your opponent plays.", ["Minion", "Spell"]);
        let type = choice == 0 ? "Minion" : "Spell";

        plr.counter.push(type);

        let minionsKilledPassiveIndex = game.passives.push((game, key, val) => {
            if (key != "minionsKilled") return;
            if (val != self) return;

            game.functions.remove(plr.counter, type);

            game.passives.splice(minionsKilledPassiveIndex - 1, 1);
        });
    }
}
