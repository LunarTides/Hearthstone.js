module.exports = {
    name: "Mindrender Illucia",
    stats: [1, 3],
    desc: "&BBattlecry:&R Replace your hand with a copy of your opponent's until end of turn.",
    mana: 3,
    type: "Minion",
    tribe: "None",
    class: "Priest",
    rarity: "Legendary",
    set: "Scholomance Academy",
    id: 248,

    battlecry(plr, game, self) {
        let old_hand = plr.hand;

        plr.hand = [];
        plr.getOpponent().hand.forEach(c => {
            c = game.functions.cloneCard(c);
            plr.addToHand(c, false);
        });

        game.functions.addEventListener("EndTurn", () => {
            return true
        }, () => {
            plr.hand = old_hand;
        }, 1);
    }
}
