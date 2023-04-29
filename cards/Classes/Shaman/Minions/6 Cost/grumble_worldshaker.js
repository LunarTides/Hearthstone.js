module.exports = {
    name: "Grumble Worldshaker",
    displayName: "Grumble, Worldshaker",
    stats: [7, 7],
    desc: "&BBattlecry:&R Return your other minions to your hand. They cost (1).",
    mana: 6,
    type: "Minion",
    tribe: "Elemental",
    class: "Shaman",
    rarity: "Legendary",
    id: 311,

    battlecry(plr, game, self) {
        game.board[plr.id].forEach(m => {
            let copy = new game.Card(m.name, plr);
            //copy.mana = 1;
            copy.addEnchantment("mana = 1", self);

            plr.addToHand(copy);

            m.destroy();
        });
    }
}
