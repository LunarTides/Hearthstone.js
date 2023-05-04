const fs = require("fs");

module.exports = {
    name: "Sir Finley Mrrgglton",
    stats: [1, 3],
    desc: "Battlecry: Discover a new basic Hero Power.",
    mana: 1,
    type: "Minion",
    tribe: "Murloc",
    class: "Neutral",
    rarity: "Legendary",
    set: "Core",
    id: 36,

    battlecry(plr, game, card) {
        let possible_cards = [];

        fs.readdirSync(game.dirname + "/../cards/StartingHeroes").forEach(file => {
            let name = file.slice(0, -3); // Remove ".js"
            name = name.replaceAll("_", " "); // Remove underscores
            name = game.functions.capitalizeAll(name); // Capitalize all words

            let card = game.functions.getCardByName(name + " Starting Hero");

            possible_cards.push([name, card.hpDesc]);
        });

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
                p += `${i + 1}: ${v[0]}; ${v[1].slice(0, -1)},\n`;
            } catch (e) {}
        });

        p = p.slice(0, -2);
        p += "\n] ";

        let choice;

        if (plr.ai) choice = plr.ai.chooseOne(values.map(k => k[1])) + 1;
        else choice = game.input(p);
        choice = parseInt(choice) - 1;
        choice = values[choice][0];

        plr.setToStartingHero(choice);
    }
}
