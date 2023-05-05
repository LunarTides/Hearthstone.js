module.exports = {
    name: "Elwynn Boar",
    stats: [1, 1],
    desc: "Deathrattle: If you had 7 Elwynn Boars die this game, equip a 15/3 Sword of a Thousand Truths.",
    mana: 1,
    type: "Minion",
    tribe: "Beast",
    class: "Neutral",
    rarity: "Epic",
    set: "United in Stormwind",
    id: 135,

    deathrattle(plr, game, self) {
        let stat = game.events.increment(plr, "elwynnBoarsKilled");

        if (stat <= 7) return;

        plr.setWeapon(new game.Card("Elwynn Boar Sword", plr));
    }
}
