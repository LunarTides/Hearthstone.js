module.exports = {
    name: "Shudderwock",
    stats: [6, 6],
    desc: "&BBattlecry:&R Repeat all other &BBattlecries&R from cards you played this game. (Targets chosen by an AI).",
    mana: 9,
    tribe: "None",
    class: "Shaman",
    rarity: "Legendary",
    id: 314,

    battlecry(plr, game, self) {
        let cardsPlayed = game.stats.cardsPlayed[plr.id];
        cardsPlayed = cardsPlayed.map(c => c[0]).filter(c => c.battlecry && c.id != self.id);
        
        plrAi = plr.ai;

        if (!plrAi) plr.ai = new game.AI(plr);

        cardsPlayed.forEach(c => {
            c.activateBattlecry();
        });

        if (!plrAi) plr.ai = null;
    }
}
