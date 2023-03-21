module.exports = {
    name: "Tamsins Phylactery",
    displayName: "Tamsin's Phylactery",
    desc: "&BDiscover&R a friendly &BDeathrattle&R minion that died this game. Give your minions its &BDeathrattle&R.",
    mana: 4,
    class: "Warlock",
    rarity: "Legendary",
    set: "Fractured in Alterac Valley",
    spellClass: "Shadow",
    id: 296,

    cast(plr, game, self) {
        let list = game.graveyard[plr.id];
        list = list.filter(m => m.blueprint.deathrattle);
        if (list.length <= 0) return;

        let minion = game.interact.discover(self.desc, list, 3, false);
        if (!minion) return;

        game.board[plr.id].forEach(m => {
            m.addDeathrattle(minion.blueprint.deathrattle);
        });
    }
}
