'use strict';

const colors = require("colors");

try {
    require("../src/game");
} catch (err) {
    require("readline-sync").question("ERROR: This program is dependant on the modules in Hearthstone.js, so the file 'index.js' needs to be in the directory 'Hearthstone.js/deck_creator'.\n".red);
    require("process").exit(1);
}

const { Game } = require("../src/game");

const game = new Game({}, {});
const functions = game.functions;
game.dirname = __dirname + "/../";

functions.importCards("../cards");
functions.importConfig(__dirname + "/config");
// ===========================================================

const config = game.config;
const cards = functions.getCards();
const classes = functions.getClasses();

let chosen_class;
let filtered_cards = {};

let deck = [];
let runes = "";

let plr = new game.Player("");

let maxDeckLength = config.maxDeckLength;
let minDeckLength = config.minDeckLength;

function askClass() {
    game.interact.printName();
    let _class = game.input("What class to you want to choose?\n" + classes.join(", ") + "\n");
    if (_class) _class = functions.capitalizeAll(_class);

    if (!classes.includes(_class)) return askClass();

    if (_class == "Death Knight") {
        runes = "";

        while (runes.length < 3) {
            game.interact.printName();

            let rune = game.input(`What runes do you want to add (${3 - runes.length} more)\nBlood, Frost, Unholy\n`);
            if (!rune || !["B", "F", "U"].includes(rune[0].toUpperCase())) continue;

            runes += rune[0].toUpperCase();
        }

        plr.runes = runes;
    }

    return _class;
}

function showCards() {
    filtered_cards = {};
    game.interact.printName();
    showConfig();
    
    Object.entries(cards).forEach(c => {
        if (c[1].runes && !plr.testRunes(c[1].runes)) return;

        let reg = new RegExp(chosen_class + "|Neutral");
        if (reg.test(c[1].class.split(" / "))) filtered_cards[c[0]] = c[1];
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

    console.log("#\n# Rule 1. Minimum Deck Length: " + minDeckLength.toString().yellow);
    console.log("# Rule 2. Maximum Deck Length: " + maxDeckLength.toString().yellow);

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
    let _card;

    Object.keys(filtered_cards).forEach(c => {
        if (c.toLowerCase() == card.toLowerCase()) _card = filtered_cards[c];
    });

    return _card;
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

    if (!c.settings) return;

    maxDeckLength = c.settings.maxDeckSize || maxDeckLength
    minDeckLength = c.settings.minDeckSize || minDeckLength
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
    let pseudo = false;

    // Deck size warnings
    if (deck.length < minDeckLength) {
        console.log("WARNING: Rule 1 violated.".yellow);

        pseudo = true;
    }
    if (deck.length > maxDeckLength) {
        console.log("WARNING: Rule 2 violated.".yellow);

        pseudo = true;
    }

    // Check if the deck is empty
    if (deck.length <= 0) {
        console.log("ERROR: Could not generate deckcode as your deck is empty. The resulting deckcode would be invalid.".red);
        return ["", "invalid"];
    }

    let deckcode = `# ${chosen_class} # `;
    if (runes) deckcode += `[${runes}] `;

    deckcode += "/";

    let _cards = {};

    deck.forEach(c => {
        if (!_cards[c.name]) _cards[c.name] = [c, 0];
        _cards[c.name][1]++;
    });

    let __cards = {};

    Object.values(_cards).forEach(c => {
        let a = c[1];
        if (!__cards[a]) __cards[a] = [];
        __cards[a].push(c);
    });

    let str_cards = "";

    let prev_amount = 0;
    Object.values(__cards).forEach((c, i) => {
        let amount = c[0][1];

        if (i == Object.keys(__cards).length - 1) deckcode += `${amount},`;
        else deckcode += `${amount}:${__cards[amount].length},`; // "/3:5,2:8,1/";

        c.forEach(v => {
            let card = v[0];

            str_cards += `${card.id},`;

            if (amount > config.maxOfOneLegendary && card.rarity == "Legendary") {
                console.log("WARNING: Rule 4 violated. Offender: ".yellow + `{ Name: "${card.name}", Amount: "${amount}" }`);

                pseudo = true;
            }
            else if (amount > config.maxOfOneCard) {
                console.log("WARNING: Rule 3 violated. Offender: ".yellow + `{ Name: "${card.name}", Amount: "${amount}" }`);

                pseudo = true;
            }
        });
    });

    deckcode = deckcode.slice(0, -1); // Remove the last ", "

    deckcode += "/ ";
    deckcode += str_cards;
    deckcode = deckcode.slice(0, -1); // Remove the last ", "

    return pseudo ? [deckcode, "pseudo"] : [deckcode, "valid"];
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
    console.log("import   - Imports a deckcode (Overrides your deck)");
    console.log("class    - Change the class");
    console.log("help     - Displays this message");
    console.log("exit     - Quits the program");

    game.input("\nPress enter to continue...\n");
}

function getCardArg(cmd, callback) {
    let times = 1;

    let card = cmd.split(" ");
    card.shift();

    if (parseInt(card[0])) {
        times = parseInt(card[0])
        card.shift();
    }

    card = card.join(" ");

    card = findCard(card);

    if (!card) {
        game.input("Invalid card.\n".red);
        return false;
    }

    for (let i = 0; i < times; i++) callback(card);

    return card;
}

function handleCmds(cmd) {
    if (cmd == "view") {
        let card = chooseCard("View a card: ");

        viewCard(card);
    }
    else if (cmd.startsWith("view")) {
        getCardArg(cmd, viewCard);
    }
    else if (cmd == "add") {
        let card = chooseCard("Add a card to the deck: ");

        add(card);
    }
    else if (cmd.startsWith("a")) {
        getCardArg(cmd, add);
    }
    else if (cmd == "remove") {
        let card = chooseCard("Remove a card from the deck: ");

        remove(card);
    }
    else if (cmd.startsWith("r")) {
        getCardArg(cmd, remove);
    }
    else if (cmd.startsWith("deckcode")) {
        let [_deckcode, error] = deckcode();

        game.input(_deckcode + "\n");
    }
    else if (cmd.startsWith("deck")) {
        viewDeck();
    }
    else if (cmd.startsWith("import")) {
        let _deckcode = game.input("Please input a deckcode: ");

        game.config.validateDecks = false;
        deck = functions.importDeck(plr, _deckcode);
        game.config.validateDecks = true;
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
    else if (cmd.startsWith("exit")) {
        require("process").exit(1);
    }
}

chosen_class = askClass();

while (true) {
    showCards();
    handleCmds(game.input("\n> "));
}
