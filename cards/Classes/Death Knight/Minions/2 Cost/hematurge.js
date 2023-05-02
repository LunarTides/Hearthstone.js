module.exports = {
    name: "Hematurge",
    stats: [2, 3],
    desc: "Battlecry: Spend a Corpse to Discover a Blood Rune card.",
    mana: 2,
    type: "Minion",
    tribe: "None",
    class: "Death Knight",
    rarity: "Rare",
    set: "Path of Arthas",
    runes: "BB",
    id: 184,

    battlecry(plr, game, self) {
        const discoverBloodRune = () => {
            let list = game.functions.getCards();
            list = list.filter(c => (c.runes || "").includes("B"));
            if (list.length <= 0) return;

            let card = game.interact.discover("Discover a Blood Rune card.", list);
            plr.addToHand(card);
        }

        plr.tradeCorpses(1, discoverBloodRune);
    }
}
