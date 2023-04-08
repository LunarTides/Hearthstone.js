module.exports = {
    name: "Lunar Eclipse",
    desc: "Deal 3 damage to a minion. Your next spell this turn costs (2) less.",
    mana: 2,
    class: "Druid",
    rarity: "Common",
    set: "Madness at the Darkmoon Faire",
    spellClass: "Arcane",
    id: 139,

    cast(plr, game, self) {
        // Deal 3 damage to a minion.
        let minion = game.interact.selectTarget("Deal 3 damage to a minion.", true, null, "minion");
        if (!minion) return -1;

        game.functions.spellDmg(minion, 3);
        
        // Your next spell this turn costs 2 less.
        let cards = [];

        let remove = game.functions.addPassive("", true, () => {
            plr.hand.filter(c => c.type == "Spell").forEach(c => {
                if (cards.map(k => k[0]).includes(c)) return; // If the card is in the cards list, ignore it.
                let oldMana = c.mana;

                c.mana -= 2;
                if (c.mana < 0) c.mana = 0;
                cards.push([c, oldMana]);
            });
        }, -1);

        // Remove reduction when card played
        let removeCardsPlayed = game.functions.addPassive("cardsPlayed", (val) => {
            return val != self && val.type == "Spell";
        }, () => {
            cards.forEach(c => {
                c[0].mana = c[1];
            });

            remove();
        }, 1);
        

        // Remove reduction when turn ends
        game.functions.addPassive("turnEnds", (val) => {
            return game.player == plr;
        }, () => {
            cards.forEach(c => {
                c[0].mana = c[1];
            });

            remove();
            removeCardsPlayed();
        }, 1);
    }
}
