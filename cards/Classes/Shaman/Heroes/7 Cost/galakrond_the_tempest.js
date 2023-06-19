// Created by the Custom Card Creator

/**
 * @type {import("../../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Galakrond the Tempest",
    displayName: "Galakrond, the Tempest",
    desc: "&BBattlecry:&R Summon two {amount}/{amount} Storms with &BRush&R.{weapon}",
    mana: 7,
    type: "Hero",
    class: "Shaman",
    rarity: "Legendary",
    hpDesc: "Summon a 2/1 Elemental with &BRush&R.",
    hpCost: 2,
    id: 36,

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    battlecry(plr, game, self) {
        const x = self.invoke_count;
        const y = (Math.ceil((x + 1) / 2) + Math.round(x * 0.15)) * 2;

        const amount = y || 2;
        let weapon = amount >= 7;

        for (let i = 0; i < 2; i++) {
            const minion = new game.Card("Brewing Storm", plr);
            if (!minion) break;

            minion.setStats(amount, amount);
            game.summonMinion(minion, plr);
        }

        if (!weapon) return;

        weapon = new game.Card("Dragon Claw", plr);
        plr.setWeapon(weapon);
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    heropower(plr, game, self) {
        const card = new game.Card("Windswept Elemental", plr);
        if (!card) return;

        game.summonMinion(card, plr);
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    invoke(plr, game, self) {
        if (!self.invoke_count) self.invoke_count = 0;
        if (self.invoke_count >= 3) self.invoke_count = 3;

        self.invoke_count++;
    },

    /**
     * @type {import("../../../../../src/types").KeywordMethod}
     */
    placeholders(plr, game, self) {
        const x = self.invoke_count;
        const y = (Math.ceil((x + 1) / 2) + Math.round(x * 0.15)) * 2;

        const amount = y || 2;
        const weapon = amount >= 7 ? " Equip a 5/2 Claw." : "";

        return {"amount": amount, "weapon": weapon};
    }
}
