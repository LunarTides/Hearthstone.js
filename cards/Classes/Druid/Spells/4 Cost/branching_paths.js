module.exports = {
    name: "Branching Paths",
    desc: "Choose Twice - Draw a card; Give your minions +1 Attack; Gain 6 Armor.",
    mana: 4,
    type: "Spell",
    class: "Druid",
    rarity: "Epic",
    set: "Kobolds & Catacombs",
    id: 22,

    cast(plr, game, card) {
        let choices = game.interact.chooseOne('Draw a card; Give your minions +1 Attack; Gain 6 Armor.', ['Draw', '+1 Attack', "+6 Armor"], 2);
        
        choices.forEach(choice => {
            if (choice == 0) {
                plr.drawCard();
            } else if (choice == 1) {
                game.board[plr.id].forEach(m => {
                    m.addStats(1, 0);
                });
            } else {
                plr.armor += 6;
            }
        });
    }
}
