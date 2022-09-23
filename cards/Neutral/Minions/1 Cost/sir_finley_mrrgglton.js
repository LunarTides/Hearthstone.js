module.exports = {
    name: "Sir Finley Mrrgglton",
    stats: [1, 3],
    desc: "Battlecry: Discover a new basic Hero Power.",
    mana: 1,
    tribe: "Murloc",
    class: "Neutral",
    rarity: "Legendary",
    set: "Core",

    battlecry(plr, game, card) {
        var possible_cards = [
            ["Demon Hunter", "Gain +1 Attack"],
            ["Druid", "Gain +1 Attack and +1 Armor"],
            ["Hunter", "Deal 2 damage to the enemy hero"],
            ["Mage", "Deal 1 damage"],
            ["Paladin", "Summon a 1/1 Silver Hand Recruit."],
            ["Priest", "Heal 2 damage"],
            ["Rogue", "Equip a 1/2 Dagger"],
            ["Shaman", "Summon a random Totem"],
            ["Warlock", "Take 2 damage, draw a card"],
            ["Warrior", "Gain +2 Armor"]
        ];

        // Remove the value in possible_cards where the key equals plr.hero_power
        possible_cards = possible_cards.filter(c => c[0] != plr.hero_power);

        var values = [];

        for (var i = 0; i < 3; i++) {
            var c = game.functions.randList(possible_cards);

            values.push(c);
            possible_cards.splice(possible_cards.indexOf(c), 1);
        }

        var p = `\nChoose a new Hero Power.\n[\n`;

        values.forEach((v, i) => {
            // Check for a TypeError and ignore it
            try {
                p += `${i + 1}: ${v[0]}; ${v[1]},\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        plr.hero_power = values[parseInt(game.input(p)) - 1][0];
    }
}