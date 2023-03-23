module.exports = {
    name: "Hagatha the Witch",
    desc: "&BBattlecry:&R Deal 3 damage to all minions.",
    mana: 8,
    class: "Shaman",
    rarity: "Legendary",
    hpDesc: "&BPassive.&R After you play a minion, add a random Shaman spell to your hand.",
    hpCost: 0,
    id: 310,

    battlecry(plr, game, self) {
        // Deal 3 damage to all minions.
        game.board.forEach(p => {
            p.forEach(m => {
                game.attack(3, m);
            });
        });

        // Hero power
        game.functions.addPassive("cardsPlayed", (key, val) => {
            return game.player == plr && val.type == "Minion";
        }, () => {
            let list = Object.values(game.functions.getCards());
            list = list.filter(c => c.type == "Spell" && c.class == "Shaman");

            let card = game.functions.randList(list);
            if (!card) return;

            card = new game.Card(card.name, plr);

            plr.addToHand(card);
        }, -1);
    },

    heropower(plr, game, self) {
        if (plr.ai) return -1;

        game.input("Cannot use passive hero power!\n".red);
    }
}
