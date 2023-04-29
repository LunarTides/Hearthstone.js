module.exports = {
    name: "Adorable Infestation",
    desc: "Give a minion +1/+1. Summon a 1/1 Cub. Add a Cub to your hand.",
    mana: 1,
    type: "Spell",
    class: "Druid",
    rarity: "Rare",
    set: "Voyage to the Sunken City",
    id: 13,

    cast(plr, game, card) {
        let target = game.interact.selectTarget("Give a minion +1/+1.", true, null, "minion");

        if (!target) {
            return -1;
        }

        target.addStats(1, 1);

        game.summonMinion(new game.Card("Marsuul Cub", plr), plr);

        plr.addToHand(new game.Card("Marsuul Cub", plr));
    }
}
