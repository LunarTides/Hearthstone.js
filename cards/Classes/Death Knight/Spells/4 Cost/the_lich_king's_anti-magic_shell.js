module.exports = {
    name: "The Lich King's Anti-Magic Shell",
    displayName: "Anti-Magic Shell",
    desc: "Give your minions +2/+2 and \"Can't be targeted by spells or Hero Powers.\"",
    mana: 4,
    type: "Spell",
    class: "Death Knight",
    rarity: "Free",
    set: "Knights of the Frozen Throne",
    spellClass: "Shadow",
    uncollectible: true,
    id: 123,

    cast(plr, game, self) {
        game.board[plr.id].forEach(m => {
            m.addStats(2, 2);
            m.addKeyword("Elusive");
        });
    }
}
