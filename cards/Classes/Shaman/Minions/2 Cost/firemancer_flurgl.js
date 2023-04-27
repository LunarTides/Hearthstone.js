module.exports = {
    name: "Firemancer Flurgl",
    stats: [2, 3],
    desc: "After you play a Murloc, deal 1 damage to all enemies.",
    mana: 2,
    tribe: "Murloc",
    class: "Shaman",
    rarity: "Legendary",
    id: 305,

    passive(plr, game, self, key, val) {
        if (key != "PlayCard") return;
        if (val.type != "Minion" || !game.functions.matchTribe(val.tribe, "Murloc") || val == self) return;

        game.functions.doPlayerTargets(plr.getOpponent(), t => {
            let dmg = 1;
            
            if (self.keywords.includes("Poisonous") && t instanceof game.Card) dmg = t.getHealth();
            game.attack(dmg, t);
        });
    }
}
