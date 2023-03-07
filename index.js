const rl = require("readline-sync");

const cls = () => process.stdout.write("\033c");

const watermark = () => {
    cls();
    console.log("Hearthstone.js Runner (C) 2023\n");
}

decks = [];

function store_deck(deckcode) {
    decks.push(deckcode);
}
function free_decks() {
    decks = [];
}

function devmode() {
    while (true) {
        watermark();

        let user = rl.question("Create a (C)ard, Go (B)ack to Normal Mode: ");
        if (!user) continue;
        
        user = user[0].toLowerCase();

        if (user == "c") {
            cls();

            require("./card_creator/index").main();
        }
        else if (user == "b") {
            break;
        }
    }
}

exports.store_deck = store_deck;
exports.free_decks = free_decks;

while (true) {
    watermark();

    let user = rl.question("(P)lay, Create a (D)eck, Developer (M)ode, (E)xit: ");
    if (!user) continue;

    user = user[0].toLowerCase();

    if (user == "p") require("./src/index").runner(decks);
    else if (user == "d") require("./deck_creator/index").runner();
    else if (user == "m") devmode();
    else if (user == "e") process.exit(0);
}
