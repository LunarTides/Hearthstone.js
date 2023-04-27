const rl = require("readline-sync");
const fs = require("fs");
const cc = require("../index");

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

function main(home = ".") {
    console.log("Hearthstone.js Vanilla Card Creator (C) 2023\n");

    let data = fs.readFileSync(home + "/.ignore.cards.json", { encoding: 'utf8', flag: 'r' });

    data = JSON.parse(data);

    let debug = !rl.keyInYN("Do you want the card to actually be created?");
    cc.set_debug(debug);

    while (true) {
        let cardName = rl.question("Name: ");

        let filtered_cards = data.filter(c => c.name.toLowerCase() == cardName.toLowerCase());

        if (filtered_cards.length <= 0) {
            console.log("Invalid card.\n");
            continue;
        }

        let card;

        if (filtered_cards.length > 1) {
            // Prompt the user to pick one
            filtered_cards.forEach((c, i) => {
                // Get rid of useless information
                delete c["id"];
                delete c["artist"];
                delete c["dbfId"];
                delete c["heroPowerDbfId"];
                delete c["flavor"];
                delete c["mechanics"];
                delete c["elite"];

                console.log(`\n${i + 1}:`);
                console.log(c);
            });

            let picked = rl.question(`Pick one (1-${filtered_cards.length}): `);

            card = filtered_cards[picked - 1];
        }
        else card = filtered_cards[0];

        // Harvest info
        let cardClass = capitalize(card.cardClass);
        let collectible = card.collectible || false;
        let mana = card.cost;
        let name = card.name;
        let rarity = "Free";
        if (card.rarity) rarity = capitalize(card.rarity);
        let desc = card.text;
        let type = capitalize(card.type);

        // Minion info
        let attack = card.attack || -1;
        let health = card.health || -1;
        let race = card.race || null;
        let races = [];
        if (card.races) races = card.races.map(r => capitalize(r));

        // Spell info
        let spellClass = card.spellSchool || null;

        // Weapon Info
        let durability = card.durability || -1;

        // Modify the desc
        desc = desc.replaceAll("\n", " ");
        desc = desc.replaceAll("<b>", "&B");
        desc = desc.replaceAll("</b>", "&R");
        desc = desc.replaceAll("[x]", "");

        let realName = rl.question("Override name (this will set 'name' to be the displayname instead) (leave empty to not use display name): ") || name;

        let _card = {
            name: realName
        };

        if (realName != name) {
            _card.displayName = name;
        }

        let struct;

        if (type == "Minion") {
            struct = {
                stats: `[${attack}, ${health}]`,
                desc: desc,
                mana: mana,
                tribe: races.join(" / "),
                class: cardClass,
                rarity: rarity
            }
        }
        else if (type == "Spell") {
            struct = {
                desc: desc,
                mana: mana,
                class: cardClass,
                rarity: rarity
            }
        }
        else if (type == "Weapon") {
            struct = {
                stats: `[${attack}, ${durability}]`,
                desc: desc,
                mana: mana,
                class: cardClass,
                rarity: rarity
            }
        }
        else if (type == "Hero") {
            struct = {
                desc: desc,
                mana: mana,
                class: cardClass,
                rarity: rarity,
                hpDesc: "",
                hpCost: 2
            }
        }
        else if (type == "Location") {
            struct = {
                stats: `[0, ${health}]`,
                desc: desc,
                mana: mana,
                class: cardClass,
                rarity: rarity,
                cooldown: 2
            }
        }
        else {
            console.log(`${type} is not a valid type!`);
            process.exit(1);
        }

        if (!collectible) struct.uncollectible = true;

        card = Object.assign({}, _card, struct);

        console.log(card);
        cc.main(type, null, null, card);
    }
}

exports.main = main;

if (require.main == module) main();
