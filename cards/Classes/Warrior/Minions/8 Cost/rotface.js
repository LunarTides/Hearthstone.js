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

    passive(plr, game, self, trigger) {
        if (!self.passiveCheck(trigger, "minionsDamaged")) return;
        if (trigger[1][0] != self || trigger[1][1] >= self.getHealth()) return;

        let cards = Object.values(game.functions.getCards()).filter(c => c.rarity == "Legendary" && game.functions.getType(c) == "Minion");
        let card = game.functions.randList(cards);
        card = new game.Card(card.name, plr);

        game.summonMinion(card, plr);
    }
}
