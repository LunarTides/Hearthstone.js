module.exports = {
    name: "Woecleaver",
    stats: [3, 3],
    desc: "After your hero attacks, Recruit a minion.",
    mana: 8,
    class: "Warrior",
    rarity: "Legendary",
    set: "Kobolds & Catacombs",
    id: 131,

    onattack(plr, game, self) {
        game.functions.recruit(plr);
    }
}
