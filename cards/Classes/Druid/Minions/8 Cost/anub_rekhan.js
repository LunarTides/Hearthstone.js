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

        let remove = game.functions.addEventListener("", true, () => {
            plr.hand.filter(c => c.type == "Minion").forEach(m => {
                m.costType = "armor";
            });
        }, -1);

        let count = 0;

        let removeCardsPlayed = game.functions.addEventListener("PlayCard", (val) => {
            return val.type == "Minion";
        }, () => {
            if (count < 3) {
                count++;
                return;
            }

            // Reverse
            remove();

            plr.hand.filter(c => c.type == "Minion").forEach(m => {
                m.costType = "mana";
            });

            return true;
        }, -1);

        game.functions.addEventListener("EndTurn", true, () => {
            // Revert and remove the effect
            remove();
            removeCardsPlayed();

            plr.hand.filter(c => c.type == "Minion").forEach(m => {
                m.costType = "mana";
            });
        }, 1);
    }
}
