module.exports = {
    name: "Sidequest Test",
    desc: "Sidequest: Take no damage for a turn. Reward: Gain +5 Armor.",
    mana: 1,
    class: "Mage",
    rarity: "Free",
    set: "Legacy",

    cast(plr, game, card) {
        game.functions.addSidequest(plr, card, "turnStarts", 1, (_, game, turn) => {
            heroAttacked = game.stats.heroAttacked[game.opponent.id];
            heroAttacked = heroAttacked.filter(x => x[2] == game.turns || x[2] == game.turns - 1);

            if (heroAttacked.length < 1) {
                game.player.armor += 5;

                game.functions.progressQuest(this.name, 1);

                return true;
            }
        }, true);
    }
}