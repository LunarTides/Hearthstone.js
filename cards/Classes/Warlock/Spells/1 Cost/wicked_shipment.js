module.exports = {
    name: "Wicked Shipment",
    desc: "&BTradeable.&R Summon 2 1/1 Imps. (Upgrades by 2 when &BTraded&R!)",
    mana: 1,
    type: "Spell",
    class: "Warlock",
    rarity: "Common",
    set: "Deadmines",
    keywords: ["Tradeable"],
    id: 300,

    passive(plr, game, self, key, val) {
        if (self.storage.length > 0) return;

        const updateDesc = (_old, _new) => {
            self.desc = self.desc.replace(`Summon ${_old} 1/1 Imps.`, `Summon ${_new} 1/1 Imps.`);
        }

        self.storage.push(2);
        game.functions.addEventListener("TradeCard", (_key, _val) => {
            return _val == self;
        }, () => {
            if (self.storage.length >= 2) return true;

            self.storage[0] += 2;

            let amount = self.storage[0];

            if (self.storage[0] <= game.config.maxBoardSpace) {
                updateDesc(amount - 2, amount);
                return;
            };

            // The amount of minions summoned is more than the max amount of minions allowed on the board
            updateDesc(amount - 2, game.config.maxBoardSpace);
            self.storage[0] = game.config.maxBoardSpace;

            self.desc = self.desc.replace(game.functions.parseTags(" (Upgrades by 2 when &BTraded&R!)"), ""); // Remove "Upgrades by 2 when traded" from description
            return true;
        }, -1);
    },

    cast(plr, game, self) {
        // Remove the passive
        self.storage.push("remove");

        // Summon the minions
        const doSummon = () => {
            let minion = new game.Card("Imp", plr);
            game.summonMinion(minion, plr);
        }

        for (let i = 0; i < self.storage[0]; i++) doSummon();
    }
}
