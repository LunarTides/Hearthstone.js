module.exports = {
    name: "Swindle",
    desc: "Draw a spell. &BCombo:&R And a minion.",
    mana: 2,
    type: "Spell",
    class: "Rogue",
    rarity: "Common",
    set: "Madness at the Darkmoon Faire",
    id: 281,

    cast(plr, game, self, type = "Spell") {
        let list = plr.deck.filter(c => c.type == type);
        let card = game.functions.randList(list, false);
        if (!card) return;

        plr.drawSpecific(card);
    },

    combo(plr, game, self) {
        self.activate("cast", "Minion");
    }
}
