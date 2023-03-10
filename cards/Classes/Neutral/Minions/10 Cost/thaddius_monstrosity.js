module.exports = {
    name: "Thaddius Monstrosity",
    displayName: "Thaddius, Monstrosity",
    stats: [11, 11],
    desc: "&BTaunt.&R Your odd-Cost cards cost (1). (Swaps polarity each turn!)",
    mana: 10,
    tribe: "Undead",
    class: "Neutral",
    rarity: "Legendary",
    set: "Return to Naxxramas",
    keywords: ["Taunt"],
    id: 252,

    battlecry(plr, game, self) {
        self.activate("passive", "turnStarts", game.turns); // Fun and goofy code with no future consequence whatsoever! :)
    },

    passive(plr, game, self, key, val) {
        if (key != "turnStarts" || game.player != plr) return;

        if (typeof(self.storage) != "number") self.storage = 1; // 0 = Even, 1 = Odd. I do it this way in order to use the modulo operation
        else self.storage = (self.storage == 0) ? 1 : 0;

        let hand = plr.hand.filter(c => c.mana % 2 == self.storage);

        hand.forEach(c => {
            c.mana = 1;
        });
        plr.hand.filter(c => !hand.includes(c)).forEach(c => {
            c.mana = c.backups.mana;
        });
    }
}
