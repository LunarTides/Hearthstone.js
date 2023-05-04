module.exports = {
    name: "Zombees",
    displayName: "ZOMBEEEES!!!",
    desc: "&BSecret:&R After your opponent plays a minion, summon four 1/1 Zombees to attack it.",
    mana: 2,
    type: "Spell",
    class: "Hunter",
    rarity: "Common",
    set: "Return to Naxxramas",
    id: 226,

    cast(plr, game, self) {
        game.functions.addQuest("Secret", plr, self, "PlayCard", 1, (card, _, turn) => {
            if (card.type != "Minion") return;

            // The opponent has played a minion
            let zombees = [];

            for (let i = 0; i < 4; i++) zombees.push(new game.Card("Zombee", plr));

            zombees.forEach(z => {
                game.summonMinion(z, plr);
                z.sleepy = false;
            });
            
            let minionKilled = false;

            zombees.forEach(z => {
                if (!minionKilled) game.attack(z, card);
                z.sleepy = true;
                z.attackTimes = 0;

                if (card.getHealth() <= 0) minionKilled = true;
            });

            return true;
        }, null, true);
    }
}
