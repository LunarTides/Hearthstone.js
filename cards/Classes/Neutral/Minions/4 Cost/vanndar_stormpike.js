module.exports = {
    name: "Vanndar Stormpike",
    stats: [4, 4],
    desc: "Battlecry: If this costs less than every minion in your deck, reduce their Cost by (3).",
    mana: 4,
    tribe: "None",
    class: "Neutral",
    rarity: "Legendary",
    set: "Fractured in Alterac Valley",
    id: 204,

    battlecry(plr, game, self) {
        let cond = true;

        let list = plr.deck.filter(c => c.type == "Minion");
        list.forEach(m => {
            if (m.mana < self.mana) cond = false;
        });

        if (!cond) return;

        // Condition cleared
        list.forEach(m => {
            m.mana -= 3;
            if (m.mana < 0) m.mana = 0;
        });
    }
}
