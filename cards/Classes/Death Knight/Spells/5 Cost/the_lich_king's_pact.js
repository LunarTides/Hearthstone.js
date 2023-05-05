module.exports = {
    name: "The Lich King's Pact",
    displayName: "Doom Pact",
    desc: "Destroy all minions. Remove the top card from your deck for each minion destroyed.",
    mana: 5,
    type: "Spell",
    class: "Death Knight",
    rarity: "Free",
    set: "Knights of the Frozen Throne",
    spellClass: "Shadow",
    uncollectible: true,
    id: 128,

    cast(plr, game, self) {
        let minionsDestroyed = 0;

        game.board.forEach(p => {
            p.forEach(m => {
                m.destroy();
                minionsDestroyed++;
            });
        });

        plr.deck.splice(plr.deck.length - minionsDestroyed, minionsDestroyed);
    }
}
