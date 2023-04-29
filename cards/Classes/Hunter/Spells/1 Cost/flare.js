module.exports = {
    name: "Flare",
    desc: "All minions lose Stealth. Destroy all enemy Secrets. Draw a card.",
    mana: 1,
    type: "Spell",
    class: "Hunter",
    rarity: "Rare",
    set: "Legacy",
    id: 214,

    cast(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                m.removeKeyword("Stealth");
            });
        });

        plr.getOpponent().secrets = [];

        plr.drawCard();
    }
}
