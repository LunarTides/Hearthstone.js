module.exports = {
    name: "Murgur Murgurgle Prime",
    displayName: "Murgurgle Prime",
    stats: [6, 3],
    desc: "&BDivine Shield. Battlecry:&R Summon 4 random Murlocs. Give them &BDivine Shield&R",
    mana: 8,
    tribe: "Mech / Murloc",
    class: "Paladin",
    rarity: "Free",
    set: "Ashes of Outland",
    keywords: ["Divine Shield"],
    uncollectible: true,

    battlecry(plr, game, self) {
        let list = game.functions.getCards().filter(c => game.functions.getType(c) == "Minion" && game.functions.matchTribe(c.tribe, "Murloc"));

        for (let i = 0; i < 4; i++) {
            let minion = game.functions.randList(list);
            minion = new game.Card(minion.name, plr);

            minion.addKeyword("Divine Shield");
            game.summonMinion(minion, plr);
        }
    }
}
