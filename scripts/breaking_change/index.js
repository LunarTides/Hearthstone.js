//@ts-check
const fs = require("fs");
const rl = require("readline-sync");
const { Game } = require("../../src/game");
const { editor } = require("../../config/general.json");
const { Player } = require("../../src/player");

const player1 = new Player("Player 1");
const player2 = new Player("Player 2");
const game = new Game(player1, player2);
game.functions.importCards(__dirname + "/../../cards");
game.functions.importConfig(__dirname + "/../../config");

let matchingCards = [];
let finishedCards = [];

let finishedCardsPath = "patched_cards.txt";

function getFinishedCards(path) {
    if (!fs.existsSync(path)) return; // If the file doesn't exist, return.

    let cards = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
    finishedCards = cards.split("\n");
}

/**
 * @param {RegExp | string} query 
 * @param {string} [path=null] 
 */
function searchCards(query, path = null) {
    if (!path) path = __dirname + "/../../cards";
    if (path == __dirname + "/../../cards/Tests") return; // We don't care about test cards

    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        let p = `${path}/${file.name}`;

        if (file.name.endsWith(".js")) {
            // It is already finished
            if (finishedCards.includes(p)) return;

            // It is an actual card.
            let data = fs.readFileSync(p, { encoding: 'utf8', flag: 'r' });

            // The query is not a regular expression
            if (typeof query === 'string') {
                if (data.includes(query)) matchingCards.push(p);
                return;
            }

            // The query is a regex
            if (query.test(data)) matchingCards.push(p);
        }
        else if (file.isDirectory()) searchCards(query, p);
    });
}

let use_regex = rl.keyInYN("Do you want to use regular expressions? (Don't do this unless you know what regex is, and how to use it)");
let search = rl.question("Search: ");

if (use_regex) search = new RegExp(search, "i");

finishedCardsPath = `./${search}_${finishedCardsPath}`;
finishedCardsPath = finishedCardsPath.replace(/[^\w ]/g, "_"); // Remove any character that is not in /A-Za-z0-9_ /

getFinishedCards(finishedCardsPath);
searchCards(search); // Ignore case

console.log(); // New line

while (true) {
    game.interact.cls();

    matchingCards.forEach((c, i) => {
        // `c` is the path to the card.
        let _c = c.replace(__dirname + "/../../cards/", "");
        console.log(`${i + 1}: ${_c}`);
    });

    let index = rl.question("\nWhich card do you want to fix (type 'done' to finish | type 'delete' to delete the save file): ");
    if (index.toLowerCase().startsWith("done")) break;
    if (index.toLowerCase().startsWith("delete")) {
        console.log("Deleting file...");

        if (fs.existsSync(finishedCardsPath)) {
            fs.unlinkSync(finishedCardsPath);
            console.log("File deleted!");
        }
        else console.log("File not found!");

        rl.question();
        process.exit(0);
    }

    if (!index || !parseInt(index)) continue;

    index = parseInt(index) - 1;
    path = matchingCards[index];

    // `card` is the path to that card.
    let success = game.functions.openWithArgs(editor, `"${path}"`);
    if (!success) rl.question(); // The `openWithArgs` shows an error message for us, but we need to pause.

    finishedCards.push(path);
    matchingCards.splice(index, 1);

    if (matchingCards.length <= 0) {
        // All cards have been patched
        rl.question("All cards patched!\n");
        if (fs.existsSync(finishedCardsPath)) fs.unlinkSync(finishedCardsPath);

        process.exit(0); // Exit so it doesn't save
    }
}

// Save progress
fs.writeFileSync(finishedCardsPath, finishedCards.join('\n'));
