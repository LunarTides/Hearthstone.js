module.exports = {
    name: "Gather Your Party",
    desc: "Recruit a minion.",
    mana: 6,
    class: "Warrior",
    rarity: "Rare",
    set: "Kobolds & Catacombs",
    id: 118,

    cast(plr, game, self) {
        game.functions.recruit(plr);
    }
}
