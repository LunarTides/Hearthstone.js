module.exports = {
    name: "Placeholder Test",
    desc: "&BBattlecry:&R Gain mana equal to how many cards you have played this turn. (Currently {0}, {1}, {0}, {next thing is} {10}, {placeholder without replacement})",
    mana: 0,
    type: "Spell",
    class: "Neutral",
    rarity: "Free",
    set: "Tests",
    uncollectible: true,

    cast(plr, game, self) {
        if (self.storage.length <= 0) return;

        plr.gainMana(self.storage[0], true);
    },

    passive(plr, game, self, key, val) {
        if (key != "PlayCard") return;

        // A card was played
        if (self.storage.length <= 0) self.storage.push(0);
        self.storage[0]++;
    },

    placeholders(plr, game, self) {
        let num_cards = self.storage[0];
        if (num_cards === undefined) num_cards = 0;

        return {0: num_cards, 1: "haha lol", 10: "test", "next thing is": "The next thing is:"}; // The placeholder is stored in this card's storage.
    }
}
