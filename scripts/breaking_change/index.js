const fs = require("fs");
const rl = require("readline-sync");
const { Game } = require("../../src/game");
const { editor } = require("../../config/general.json");

const game = new Game({}, {});
game.dirname = __dirname + "/../";

game.functions.importCards(__dirname + "/../../cards");
game.functions.importConfig(__dirname + "/../../config");

let matchingCards = [];
let finishedCards = [];

let finishedCardsPath = "patched_cards.txt";

const cls = () => process.stdout.write('\033c');

function getFinishedCards(path) {
    if (!fs.existsSync(path)) return; // If the file doesn't exist, return.

    let cards = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
    finishedCards = cards.split("\n");
}

function searchCards(query, path = __dirname + "/../../cards") {
    if (path == __dirname + "/../../cards/Tests") return; // We don't care about test cards

    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        let p = `${path}/${file.name}`;

        if (file.name.endsWith(".js")) {
            // It is an actual card.
            let data = fs.readFileSync(p, { encoding: 'utf8', flag: 'r' });

            if (query.test(data) && !finishedCards.includes(p)) matchingCards.push(p);
        }
        else if (file.isDirectory()) searchCards(query, p);
    });
}

let reg = rl.question("Search: ");

finishedCardsPath = `./${reg}_${finishedCardsPath}`;
finishedCardsPath = finishedCardsPath.replace(/[^\w ]/g, "_"); // Remove any character that is not in /A-Za-z0-9_ /

getFinishedCards(finishedCardsPath);
searchCards(new RegExp(reg, "i")); // Ignore case

console.log(); // New line

while (true) {
    cls();

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