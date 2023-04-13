module.exports = {
    name: "Death Speaker Blackthorn",
    stats: [3, 6],
    desc: "Battlecry: Summon 3 Deathrattle minions that cost (5) or less from your deck.",
    mana: 7,
    tribe: "Quilboar",
    class: "Demon Hunter",
    rarity: "Legendary",
    set: "Forged in the Barrens",
    id: 212,

    battlecry(plr, game, self) {
        let list = plr.deck.filter(c => c.type == "Minion" && c.deathrattle || false);

        for (let i = 0; i <= list.length; i++) {
            let minion = game.functions.randList(list, false);
            if (!minion) continue;

            game.functions.remove(list, minion);

            minion = game.functions.cloneCard(minion);

            game.summonMinion(minion, plr);
        }
    }
}
