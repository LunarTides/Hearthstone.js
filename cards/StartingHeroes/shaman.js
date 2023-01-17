module.exports = {
    name: "Shaman Starting Hero",
    displayName: "Thrall",
    desc: "Shaman starting hero",
    mana: 0,
    class: "Shaman",
    rarity: "Free",
    set: "Core",
    hpDesc: "Summon a random Totem.",
    uncollectible: true,
    id: 101,

    heropower(plr, game, self) {
        const totem_cards = ["Healing Totem", "Searing Totem", "Stoneclaw Totem", "Strength Totem"];
        let _totem_cards;

        game.board[plr.id].forEach(m => {
            if (totem_cards.includes(m.displayName)) {
                _totem_cards.push(new game.Card(m.name, plr));
            }
        });

        if (_totem_cards.length == 0) return false;

        const card = game.functions.randList(_totem_cards, false);

        game.summonMinion(card, plr);
    }
}
