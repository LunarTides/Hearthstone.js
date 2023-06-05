// Created by the Custom Card Creator

/**
 * @type {import("../../../../src/types").Blueprint}
 */
module.exports = {
    name: "Wandering Monster",
    desc: "&BSecret:&R When an enemy attacks your hero, summon a 3-Cost minion as the new target.",
    mana: 2,
    type: "Spell",
    class: "Hunter",
    rarity: "Rare",
    set: "Kobolds & Catacombs",
    id: 225,

    /**
     * @type {import("../../../../src/types").KeywordMethod}
     */
    cast(plr, game, self) {
        game.functions.addQuest("Secret", plr, self, "Attack", 1, (attack, turn, done) => {
            let [attacker, target] = attack;
            if (target != plr) return false;
            if (!done) return;

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
        });
    }
}
