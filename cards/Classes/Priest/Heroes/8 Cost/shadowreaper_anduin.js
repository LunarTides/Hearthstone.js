module.exports = {
    name: "Shadowreaper Anduin",
    desc: "&BBattlecry:&R Destroy all minions with 5 or more Attack.",
    mana: 8,
    class: "Priest",
    rarity: "Legendary",
    set: "Knights of the Frozen Throne",
    hpDesc: "Deal 2 damage. After you play a card, refresh this.",
    id: 244,

    battlecry(plr, game, self) {
        game.board.forEach(p => {
            p.forEach(m => {
                if (m.getAttack() < 5) return;

                m.kill();
            });
        });

        game.functions.addPassive("cardsPlayed", (key, val) => {
            return game.player == plr;
        }, () => {
            plr.canUseHeroPower = true;
        }, -1);
    },

    heropower(plr, game, self) {
        let target = game.interact.selectTarget("Deal 2 damage.", true);
        if (!target) return -1;

        game.attack(2, target);
    }
}
