module.exports = {
    name: "Anub Rekhan",
    displayName: "Anub'Rekhan",
    stats: [7, 7],
    desc: "Battlecry: Gain 8 Armor. Your next 3 minions this turn cost Armor instead of Mana.",
    mana: 8,
    tribe: "Undead",
    class: "Druid",
    rarity: "Legendary",
    set: "March of the Lich King",
    id: 166,

    battlecry(plr, game, self) {
        plr.armor += 8;

        let passiveIndex = game.passives.push((game, key, val) => {
            plr.hand.filter(c => c.type == "Minion").forEach(m => {
                m.costType = "armor";
            });
        });

        let count = 0;

        let cardsPlayedPassiveIndex = game.passives.push((game, key, val) => {
            if (key != "cardsPlayed" || val.type != "Minion" || count == -1) return;
            if (count < 3) {
                count++;
                return;
            };

            plr.hand.filter(c => c.type == "Minion").forEach(m => {
                m.costType = "mana";
            });

            count = -1;
        });


        let turnEndsPassiveIndex = game.passives.push((game, key, val) => {
            if (key != "turnEnds") return;

            // Revert and remove the effect
            plr.hand.filter(c => c.type == "Minion").forEach(m => {
                m.costType = "mana";
            });

            game.passives.splice(passiveIndex - 1, 1);
            game.passives.splice(cardsPlayedPassiveIndex - 1, 1);
            game.passives.splice(turnEndsPassiveIndex - 1, 1);
        });
    }
}
