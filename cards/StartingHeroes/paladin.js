module.exports = {
    name: "Paladin Starting Hero",
    displayName: "Uther Lightbringer",
    desc: "Paladin starting hero",
    mana: 0,
    class: "Paladin",
    rarity: "Free",
    set: "Core",

    heropower(plr, game, self) {
        const card = new game.Card("Silver Hand Recruit", plr);

        game.summonMinion(card, plr);
    }
}
