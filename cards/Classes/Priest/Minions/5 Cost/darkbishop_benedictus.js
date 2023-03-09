module.exports = {
    name: "Darkbishop Benedictus",
    stats: [5, 6],
    desc: "&BStart of Game:&R If the spells in your deck are all Shadow, enter Shadowform.",
    mana: 5,
    tribe: "None",
    class: "Priest",
    rarity: "Legendary",
    set: "United in Stormwind",
    id: 243,

    startofgame(plr, game, self) {
        // Condition
        let filtered_deck = plr.deck.filter(c => c.type == "Spell" && (!c.spellClass || !c.spellClass.includes("Shadow")));
        if (filtered_deck.length > 0) return;

        // Condition cleared
        plr.hero.heropower = [(_plr, _game, _self) => {
            let target = game.interact.selectTarget("Deal 2 damage.", true);
            if (!target) return -1;

            game.attack(2, target);
        }];
        plr.hero.hpDesc = "Deal 2 damage.";
        plr.heroPowerCost = 2;
    }
}
