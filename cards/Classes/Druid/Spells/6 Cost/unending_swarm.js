module.exports = {
    name: "Unending Swarm",
    desc: "Resurrect all friendly minions that costs (2) or less.",
    mana: 6,
    type: "Spell",
    class: "Druid",
    rarity: "Common",
    set: "March of the Lich King",
    id: 143,

    cast(plr, game, self) {
        game.graveyard[plr.id].forEach(m => {
            if (m.mana > 2) return;

            let copy = new game.Card(m.name, plr);

            game.summonMinion(copy, plr);
        });
    }
}
