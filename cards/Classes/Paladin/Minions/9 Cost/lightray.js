module.exports = {
    name: "Lightray",
    stats: [5, 5],
    desc: "&BTaunt.&R Costs (1) less for each Paladin card you've played this game.",
    mana: 9,
    tribe: "Elemental / Beast",
    class: "Paladin",
    rarity: "Common",
    set: "Throne of the Tides",
    keywords: ["Taunt"],
    id: 270,

    handpassive(plr, game, self, key, val) {
        // This is a bad solution, as it is with every card that changes cost in some way.
        // These cards do not work with each other as most solutions uses 'self.backups.mana' which prevents
        // cooperation with other cost-changing cards, eg. Generous Mummy.
        if (!game.stats.cardsPlayed) return; // Noone has played any cards yet.
        let cards_played = game.stats.cardsPlayed[plr.id].map(c => c[0]).filter(c => c.class.includes("Paladin")).length;

        self.mana = self.backups.mana - cards_played;
        if (self.mana < 0) self.mana = 0;
    }
}
