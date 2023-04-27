module.exports = {
    name: "Rotface",
    stats: [4, 6],
    desc: "After this minion survives damage, summon a random Legendary minion.",
    mana: 8,
    tribe: "Undead",
    class: "Warrior",
    rarity: "Legendary",
    set: "Knights of the Frozen Throne",
    id: 121,

    passive(plr, game, self, key, val) {
        if (key != "DamageMinion") return;
        if (val[0] != self || self.getHealth() <= 0) return;

        let cards = game.functions.getCards().filter(c => c.rarity == "Legendary" && game.functions.getType(c) == "Minion");
        let card = game.functions.randList(cards);
        card = new game.Card(card.name, plr);

        game.summonMinion(card, plr);
    }
}
