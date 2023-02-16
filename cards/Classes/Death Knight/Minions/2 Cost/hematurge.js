module.exports = {
    name: "Hematurge",
    stats: [2, 3],
    desc: "Battlecry: Spend a Corpse to Discover a Blood Rune card.",
    mana: 2,
    tribe: "None",
    class: "Death Knight",
    rarity: "Rare",
    set: "Path of Arthas",
    runes: "BB",
    id: 184,

    battlecry(plr, game, self) {
        const discoverBloodRune = () => {
            let list = Object.values(game.functions.getCards());
            list = list.filter(c => (c.runes || "").includes("B"));
            if (list.length <= 0) return;

            game.interact.discover("Discover a Blood Rune card.", list);
        }

        plr.tradeCorpses(1, discoverBloodRune);
    }
}
