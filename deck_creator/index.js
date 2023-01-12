'use strict';

const colors = require("colors");
const { Game } = require("../src/game");

const game = new Game({},{},{});
const functions = game.functions;
game.dirname = __dirname + "/../";

functions.importCards("../cards");
// ===========================================================

const cards = functions.getCards();
const classes = functions.getClasses();

let chosen_class;
let filtered_cards = {};

let deck = [];

function buildMap(keys, values) {
    const map = {};

    for (let i = 0; i < keys.length; i++) {
        map.set(keys[i], values[i]);
    }

    return map;
}

function askClass() {
    game.interact.printName();
    let _class = game.input("What class to you want to choose?\n" + classes.join(", ") + "\n");
    if (_class) _class = functions.capitalizeAll(_class);

    if (!classes.includes(_class)) return askClass();

    return _class;
}

function showCards() {
    filtered_cards = {};
    game.interact.printName();
    
    Object.entries(cards).forEach(c => {
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

function chooseCard() {
    let card = game.input("Which card do you want to choose? ");
    card = functions.capitalizeAll(card);

    if (!Object.values(filtered_cards).map(c => c.name).includes(card)) return chooseCard();

    return filtered_cards[card];
}

function viewCard(c) {
    let stats = "";

    if (["Minion", "Weapon"].includes(functions.getType(c))) stats = ` [${c.stats.join(' / ')}]`.green;
    console.log(`{${c.mana}} `.cyan + functions.colorByRarity(c.name, c.rarity) + stats + ` (${c.desc}) ` + `(${functions.getType(c)})`.yellow);
}

function add(c) {
    deck.push(c);
}
function remove(c) {
    deck.splice(deck.indexOf(c), 1);
}

function viewDeck() {
    game.interact.printName();
    
    deck.forEach(c => {
        console.log(functions.colorByRarity(c.name, c.rarity));
    });

    game.input("Press enter to continue...");
}

function deckcode() {
    let deckcode = `### ${chosen_class} ### `;

    let _cards = {};

    deck.forEach(c => {
        if (!_cards[c.name]) _cards[c.name] = 0;
        _cards[c.name]++;
    });

    Object.entries(_cards).forEach(c => {
        let card = c[0];
        let amount = c[1];

        if (amount == 1) {
            deckcode += `${card}, `;
            return;
        }

        deckcode += `x${amount} ${card}, `;
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
    if (cmd.startsWith("view")) {
        let card = game.input("View a minion: ");
        if (card) card = filtered_cards[functions.capitalizeAll(card)];

        if (!card) {
            game.input("Invalid card.\n".red);
            return;
        }

        viewCard(card);
    }
    else if (cmd == "add") {
        let card = game.input("Add a card to the deck: ");
        let _card = card;
        if (card) {
            _card = filtered_cards[functions.capitalizeAll(card)];
            console.log(_card);

            if (!_card) _card = filtered_cards[card];
        }
        card = _card;

        if (!card) {
            game.input("Invalid card.\n".red);
            return;
        }

        add(card);
    }
    else if (cmd.startsWith("add")) {
        let card = cmd.split(" ");
        card.shift();
        card = card.join(" ");

        let _card = card;
        if (card) {
            _card = filtered_cards[functions.capitalizeAll(card)];
            console.log(_card);

            if (!_card) _card = filtered_cards[card];
        }
        card = _card;

        if (!card) {
            game.input("Invalid card.\n".red);
            return;
        }

        add(card);
    }
    else if (cmd.startsWith("remove")) {
        let card = game.input("Remove a card from the deck: ");
        if (card) card = filtered_cards[functions.capitalizeAll(card)];

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
        let new_class = askClass();

        if (new_class == chosen_class) {
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
    handleCmds(game.input("> "));
}
