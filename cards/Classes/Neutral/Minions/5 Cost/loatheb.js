module.exports = {
    name: "Loatheb",
    stats: [5, 5],
    desc: "Battlecry: Enemy spells cost (5) more next turn.",
    mana: 5,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Legendary",
    set: "Naxxramas",
    id: 158,

    battlecry(plr, game, self) {
        let cards = [];

        let remove = game.functions.addPassive("", true, () => {
            plr.getOpponent().hand.filter(c => c.type == "Spell").forEach(c => {
                if (cards.map(k => k[0]).includes(c)) return; // If the card is in cards, ignore it
                let oldMana = c.mana;

                c.mana += 5;

                cards.push([c, oldMana]);
            });
        }, -1);

        game.functions.addPassive("turnEnds", (val) => {
            return game.player != plr;
        }, () => {
            cards.forEach(c => {
                c[0].mana = c[1];
            });

            remove();
        }, 1);
    }
}
