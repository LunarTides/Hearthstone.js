//@ts-check
const rl = require("readline-sync");
const fs = require("fs");
const lib = require("../lib");

const { Game } = require("../../src/game");

const game = new Game({}, {});
game.functions.importCards(__dirname + "/../../cards");
game.functions.importConfig(__dirname + "/../../config");

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

function createCard(card, main) {
    // Harvest info
    let cardClass = capitalize(card.cardClass || "Neutral");
    let collectible = card.collectible || false;
    let mana = card.cost;
    let name = card.name;
    let rarity = "Free";
    if (card.rarity) rarity = capitalize(card.rarity);
    let desc = card.text || "";
    let type = capitalize(card.type);

    // Minion info
    let attack = card.attack || -1;
    let health = card.health || -1;
    let races = [];
    if (card.races) races = card.races.map(r => capitalize(r));

    // Spell info
    let spellClass = card.spellSchool ? capitalize(card.spellSchool) : null;

    // Weapon Info
    let durability = card.durability || -1;

    // Modify the desc
    desc = desc.replaceAll("\n", " ");
    desc = desc.replaceAll("<b>", "&B");
    desc = desc.replaceAll("</b>", "&R");
    desc = desc.replaceAll("[x]", "");

    const classes = game.functions.getClasses();
    classes.push("Neutral");

    while (!classes.includes(cardClass)) {
        cardClass = game.functions.capitalizeAll(game.input("Was not able to find the class of this card.\nWhat is the class of this card? ".red));
    }

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
            type: type,
            tribe: races.join(" / "),
            class: cardClass,
            rarity: rarity
        }
    }
    else if (type == "Spell") {
        struct = {
            desc: desc,
            mana: mana,
            type: type,
            spellClass: spellClass,
            class: cardClass,
            rarity: rarity
        }
    }
    else if (type == "Weapon") {
        struct = {
            stats: `[${attack}, ${durability}]`,
            desc: desc,
            mana: mana,
            type: type,
            class: cardClass,
            rarity: rarity
        }
    }
    else if (type == "Hero") {
        struct = {
            desc: desc,
            mana: mana,
            type: type,
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
            type: type,
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

    if (main) console.log(card);

    lib.set_type("Vanilla"); // Vanilla Card Creator
    lib.create(type, card, null, null);
}

function main(card = null) {
    console.log("Hearthstone.js Vanilla Card Creator (C) 2022\n");

    if (card) return createCard(card, false);

    let data = fs.readFileSync(__dirname + "/.ignore.cards.json", { encoding: 'utf8', flag: 'r' });

    data = JSON.parse(data);

    if (game.config.debug) {
        let debug = !rl.keyInYN("Do you want the card to actually be created?");
        lib.set_debug(debug);
    }

    while (true) {
        let cardName = rl.question("Name / dbfId (Type 'back' to cancel): ");
        if (["exit", "quit", "close", "back"].includes(cardName.toLowerCase())) break;

        let filtered_cards = data.filter(c => c.name.toLowerCase() == cardName.toLowerCase() || c.dbfId == cardName);
        filtered_cards = game.functions.filterVanillaCards(filtered_cards, false, true);

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

        console.log(`Found '${card.name}'\n`);

        createCard(card, true);
    }
}

exports.main = main;

if (require.main == module) main();
