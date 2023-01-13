'use strict';

const colors = require("colors");
const { Game } = require("../src/game");
const config = require("../config");

const game = new Game({}, {}, config);
const functions = game.functions;
game.dirname = __dirname + "/../";

functions.importCards("../cards");
// ===========================================================

const cards = functions.getCards();
const classes = functions.getClasses();

let chosen_class;
let filtered_cards = {};

let deck = [];
let runes = "";

function askClass() {
    game.interact.printName();
    let _class = game.input("What class to you want to choose?\n" + classes.join(", ") + "\n");
    if (_class) _class = functions.capitalizeAll(_class);

    if (!classes.includes(_class)) return askClass();

    if (_class == "Death Knight") {
        runes = [];

        while (runes.length < 3) {
            game.interact.printName();

            let rune = game.input(`What runes do you want to add (${3 - runes.length} more)\nBlood, Frost, Unholy\n`);
            if (!rune || !["B", "F", "U"].includes(rune[0].toUpperCase())) continue;

            runes += rune[0].toUpperCase();
        }
    }

    return _class;
}

function charCount(str, letter) {
    let letter_count = 0;

    for (let i = 0; i < str.length; i++) {
        if (str.charAt(i) == letter) letter_count++;
    }

    return letter_count;
}

function showCards() {
    filtered_cards = {};
    game.interact.printName();
    showConfig();
    
    Object.entries(cards).forEach(c => {
        if (c[1].runes) {
            let r = c[1].runes;

            let blood = charCount(r, "B");
            let frost = charCount(r, "F");
            let unholy = charCount(r, "U");

            let b = charCount(runes, "B");
            let f = charCount(runes, "F");
            let u = charCount(runes, "U");

            if (blood > b || frost > f || unholy > u) return;
        }
        if ([chosen_class, "Neutral"].includes(c[1].class) && c[1].set != "Tests") filtered_cards[c[0]] = c[1];
    });

    let prev_class;

    Object.values(filtered_cards).forEach(c => {
        if (prev_class != c.class) {
            console.log("\n" + c.class.rainbow);
            prev_class = c.class;
        }
        console.log(functions.colorByRarity(c.name, c.rarity));
    });
}

function showConfig() {
    let config_text = "### RULES ###";
    console.log("#".repeat(config_text.length));
    console.log(config_text);
    console.log("#".repeat(config_text.length));

    console.log("#");

    console.log("# Validation: " + (config.validateDecks ? "ON".green : "OFF".red));

    console.log("#\n# Rule 1. Minimum Deck Length: " + config.minDeckLength.toString().yellow);
    console.log("# Rule 2. Maximum Deck Length: " + config.maxDeckLength.toString().yellow);

    console.log("#\n# Rule 3. Maximum amount of cards for each card (eg. You can only have: " + "x".yellow + " Seances in a deck): " + config.maxOfOneCard.toString().yellow);
    console.log("# Rule 4. Maximum amount of cards for each legendary card (Same as Rule 3 but for legendaries): " + config.maxOfOneLegendary.toString().yellow);

    console.log("#");

    console.log("# There are 3 types of deck states: Valid, Pseudo-Valid, Invalid");
    console.log("# Valid decks will work properly");
    console.log("# Pseudo-valid decks will be rejected by the deck importer for violating a rule");
    console.log("# Invalid decks are decks with a fundemental problem that the deck importer cannot resolve. Eg. An invalid card in the deck.");
    console.log("# Violating any of these rules while validation is enabled will result in a pseudo-valid deck.");

    console.log("#");

    console.log("#".repeat(config_text.length));
}

function findCard(card) {
    let _card = card;

    if (card) {
        _card = filtered_cards[functions.capitalizeAll(card)];

        if (!_card) _card = filtered_cards[card];
    }

    card = _card;

    return card;
}

function chooseCard(prompt) {
    let card = game.input(prompt);
    card = findCard(card);

    if (!card) return chooseCard();

    return card;
}

function viewCard(c) {
    let stats = "";

    if (["Minion", "Weapon"].includes(functions.getType(c))) stats = ` [${c.stats.join(' / ')}]`.green;
    console.log(`{${c.mana}} `.cyan + functions.colorByRarity(c.name, c.rarity) + stats + ` (${c.desc}) ` + `(${functions.getType(c)})`.yellow);

    game.input("\nPress enter to continue...");
}

function add(c) {
    deck.push(c);
}
function remove(c) {
    deck.splice(deck.indexOf(c), 1);
}

function viewDeck() {
    game.interact.printName();

    console.log("Deck Size: " + deck.length.toString().yellow + "\n");

    let _cards = {};

    deck.forEach(c => {
        if (!_cards[c.name]) _cards[c.name] = [c, 0];
        _cards[c.name][1]++;
    });

    Object.values(_cards).forEach(c => {
        let card = c[0];
        let amount = c[1];

        if (amount == 1) {
            console.log(functions.colorByRarity(card.name, card.rarity));
            return;
        }

        console.log(`x${amount} ` + functions.colorByRarity(card.name, card.rarity));
    });
    
    game.input("\nPress enter to continue...");
}

function deckcode() {
    // Deck size warnings
    if (deck.length > config.maxDeckLength || deck.length < config.minDeckLength) {
        console.log("WARNING: Rule 1|2 violated.".yellow);
    }

    let deckcode = `### ${chosen_class} ### `;
    if (runes) deckcode += `[${runes}] `;

    let _cards = {};

    deck.forEach(c => {
        if (!_cards[c.name]) _cards[c.name] = [c, 0];
        _cards[c.name][1]++;
    });

    Object.values(_cards).forEach(c => {
        let card = c[0];
        let amount = c[1];

        if (amount == 1) {
            deckcode += `${card.name}, `;
            return;
        }

        deckcode += `x${amount} ${card.name}, `;

        if (amount > config.maxOfOneLegendary && card.rarity == "Legendary") {
            console.log("WARNING: Rule 4 violated. Offender: ".yellow + `{ Name: "${card.name}", Amount: "${amount}" }`);
        }
        else if (amount > config.maxOfOneCard) {
            console.log("WARNING: Rule 3 violated. Offender: ".yellow + `{ Name: "${card.name}", Amount: "${amount}" }`);
        }
    });

    deckcode = deckcode.slice(0, -2); // Remove the last ", "

    deckcode = btoa(deckcode); // base64

    game.input(deckcode + "\n");
}

function help() {
    game.interact.printName();
    console.log("(In order to run a command; input the name of the command and follow further instruction.)\n");

    console.log("Available commands:");
    console.log("(name)   - (description)\n");

    console.log("add      - Add a card to the deck");
    console.log("remove   - Remove a card from the deck");
    console.log("view     - View a card");
    console.log("deck     - View the deck");
    console.log("deckcode - View the current deckcode");
    console.log("class    - Change the class");
    console.log("help     - Displays this message");

    game.input("\nPress enter to continue...\n");
}

function handleCmds(cmd) {
    if (cmd == "view") {
        let card = chooseCard("View a card: ");

        viewCard(card);
    }
    else if (cmd.startsWith("view")) {
        let card = cmd.split(" ");
        card.shift();
        card = card.join(" ");

        card = findCard(card);

        if (!card) {
            game.input("Invalid card.\n".red);
            return;
        }

        viewCard(card);
    }
    else if (cmd == "add") {
        let card = chooseCard("Add a card to the deck: ");

        add(card);
    }
    else if (cmd.startsWith("add")) {
        let card = cmd.split(" ");
        card.shift();
        card = card.join(" ");

        card = findCard(card);

        if (!card) {
            game.input("Invalid card.\n".red);
            return;
        }

        add(card);
    }
    else if (cmd == "remove") {
        let card = chooseCard("Remove a card from the deck: ");

        remove(card);
    }
    else if (cmd.startsWith("remove")) {
        let card = cmd.split(" ");
        card.shift();
        card = card.join(" ");

        card = findCard(card);

        if (!card) {
            game.input("Invalid card.\n".red);
            return;
        }

        remove(card);
    }
    else if (cmd.startsWith("deckcode")) {
        deckcode();
    }
    else if (cmd.startsWith("deck")) {
        viewDeck();
    }
    else if (cmd.startsWith("class")) {
        let _runes = runes;
        let new_class = askClass();

        if (new_class == chosen_class && runes == _runes) {
            game.input("Your class was not changed\n".yellow);
            return;
        }

        deck = [];
        chosen_class = new_class;
    }
    else if (cmd.startsWith("help")) {
        help();
    }
}

chosen_class = askClass();

while (true) {
    showCards();
    handleCmds(game.input("\n> "));
}
