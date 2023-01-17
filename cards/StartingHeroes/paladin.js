module.exports = {
    name: "Paladin Starting Hero",
    displayName: "Uther Lightbringer",
    desc: "Paladin starting hero",
    mana: 0,
    class: "Paladin",
    rarity: "Free",
    set: "Core",
    hpDesc: "Summon a 1/1 Silver Hand Recruit.",
    uncollectible: true,
    id: 98,

    heropower(plr, game, self) {
        const card = new game.Card("Silver Hand Recruit", plr);

        game.summonMinion(card, plr);
    }
}
