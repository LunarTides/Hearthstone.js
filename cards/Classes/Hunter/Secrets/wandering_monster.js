module.exports = {
    name: "Wandering Monster",
    desc: "&BSecret:&R When an enemy attacks your hero, summon a 3-Cost minion as the new target.",
    mana: 2,
    type: "Spell",
    class: "Hunter",
    rarity: "Rare",
    set: "Kobolds & Catacombs",
    id: 225,

    cast(plr, game, self) {
        game.functions.addQuest("Secret", plr, self, "Attack", 1, (val, _, turn) => {
            let [attacker, target] = val;

            if (target != plr) return;

            // The target is your hero
            target.addHealth(attacker.getAttack()); // Heal the target

            let minions = game.functions.getCards();
            minions = minions.filter(c => c.type == "Minion" && c.mana == 3);
            let minion = game.functions.randList(minions);
            if (!minion) return;

            minion = new game.Card(minion.name, plr);

            game.summonMinion(minion, plr);

            attacker.sleepy = false;
            attacker.resetAttackTimes();
            game.attack(attacker, minion);

            return true;
        }, null, true);
    }
}
