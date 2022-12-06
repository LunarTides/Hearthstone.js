module.exports = {
    name: "Death Knight Starting Hero",
    displayName: "Lich King -- TODO: Change this to the proper displayname once i figure out what it is",
    desc: "Death knight starting hero",
    mana: 0,
    class: "Death Knight",
    rarity: "Free",
    set: "Core",

    heropower(plr, game, self) {
        // Summon a 1/1 Ghoul with Charge. It dies at end of turn.
        let minion = new game.Card("Death Knight Frail Ghoul", plr);

        game.summonMinion(minion, plr);
    }
}
