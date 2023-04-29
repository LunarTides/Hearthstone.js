module.exports = {
    name: "Reckless Apprentice",
    stats: [3, 5],
    desc: "&BBattlecry:&R Fire your Hero Power at all enemies.",
    mana: 4,
    type: "Minion",
    tribe: "None",
    class: "Mage",
    rarity: "Rare",
    id: 318,

    battlecry(plr, game, self) {
        let oldHPCost = plr.heroPowerCost;
        let oldCUHP = plr.canUseHeroPower;

        plr.heroPowerCost = 0;

        game.functions.doPlayerTargets(plr.getOpponent(), (target) => {
            plr.canUseHeroPower = true;
            plr.forceTarget = target;
            plr.heroPower();
        });

        plr.forceTarget = null;
        plr.heroPowerCost = oldHPCost;
        plr.canUseHeroPower = oldCUHP;
    }
}
