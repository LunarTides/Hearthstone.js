module.exports = {
    name: "The Purator",
    stats: [4, 6],
    desc: "&BTaunt. Battlecry: &RIf your deck has no Neutral cards, draw a minion of each minion type.",
    mana: 5,
    tribe: "Mech",
    class: "Paladin",
    rarity: "Legendary",
    set: "Return to Naxxramas",
    keywords: ["Taunt"],
    id: 266,

    battlecry(plr, game, self) {
        // Check for Neutral cards.
        let neutral_cards = plr.deck.filter(c => c.class.includes("Neutral"));
        if (neutral_cards.length > 0) return;

        // There are no Neutral cards in the player's deck.
        // Look for the different minion types.
        let ignored_tribes = ["None"];
        let minion_types = plr.deck.filter(c => c.type == "Minion" && !ignored_tribes.includes(c.tribe)).map(m => m.tribe);

        // Split dual types
        minion_types.forEach(t => {
            let s = t.split(" / ");
            if (s.length <= 1) return;

            s.forEach(type => {
                if (minion_types.includes(type)) return;

                minion_types.push(type);
            });
        });

        // Remove duplicates
        minion_types = new Set(minion_types);
        minion_types = Array.from(minion_types);

        // Select and draw one of each minion type
        minion_types.forEach(t => {
            let list = plr.deck.filter(c => c.type == "Minion" && game.functions.matchTribe(c.tribe, t));
            let minion = game.functions.randList(list, false);
            if (!minion) return; // This shouldnt ever happen since minion_types is based on what is in the player's deck but oh well

            plr.drawSpecific(minion);
        });
    }
}
