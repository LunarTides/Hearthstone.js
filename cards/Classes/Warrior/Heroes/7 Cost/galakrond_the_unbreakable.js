module.exports = {
    name: "Galakrond the Unbreakable",
    displayName: "Galakrond, the Unbreakable",
    desc: "&BBattlecry:&R Draw {amount} minion{plural}. Give {plural2} +4/+4.",
    mana: 7,
    type: "Hero",
    class: "Warrior",
    rarity: "Legendary",
    hpDesc: "Galakrond's Might",
    hpCost: 2,
    id: 322,

    battlecry(plr, game, self) {
        // Look in `Galakrond, the Nightmare` for an explanation of the formula below
        const x = self.invoke_count;
        const y = Math.ceil((x + 1) / 2) + Math.round(x * 0.15);

        const amount = y || 1;

        for (let i = 0; i < amount; i++) {
            const card = plr.drawCard();

            card.addStats(4, 4);
        }
    },

    heropower(plr, game, self) {
        plr.attack += 3;
    },

    invoke(plr, game, self) {
        if (!self.invoke_count) self.invoke_count = 0;
        if (self.invoke_count >= 3) self.invoke_count = 3;

        self.invoke_count++;
    },

    placeholders(plr, game, self) {
        const x = self.invoke_count;
        const y = Math.ceil((x + 1) / 2) + Math.round(x * 0.15);

        const amount = y || 1;
        const multiple = amount > 1;

        const plural = multiple ? "s" : "";
        const plural2 = multiple ? "them" : "it";

        return {"amount": amount, "plural": plural, "plural2": plural2};
    }
}
