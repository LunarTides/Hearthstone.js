import rl from "readline-sync";
import fs from "fs";
import config from "../../config/general.json" assert { "type": "json" };
import { Game, Player } from "../../src/internal.js";

const game = new Game();
const player1 = new Player("Player 1");
const player2 = new Player("Player 2");
game.setup(player1, player2);
game.functions.importCards(game.functions.dirname() + "cards");
game.functions.importConfig(game.functions.dirname() + "config");

let matchingCards: string[] = [];
let finishedCards: string[] = [];

let finishedCardsPath = "patched_cards.txt";

function getFinishedCards(path: string) {
    if (!fs.existsSync(path)) return; // If the file doesn't exist, return.

    let cards = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
    finishedCards = cards.split("\n");
}

/**
 * @param {RegExp | string} query 
 * @param {string} [path=null] 
 */
function searchCards(query: RegExp | string, path?: string) {
    if (!path) path = "../../cards";
    if (path == "../../cards/Tests") return; // We don't care about test cards

    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        let p = `${path}/${file.name}`;

        if (file.name.endsWith(".ts")) {
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
let search: string | RegExp = rl.question("Search: ");

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
        let _c = c.replace("../../cards/", "");
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

    let indexNum = parseInt(index) - 1;
    let path = matchingCards[indexNum];

    // `card` is the path to that card.
    let success = game.functions.openWithArgs(config.editor, `"${path}"`);
    if (!success) rl.question(); // The `openWithArgs` shows an error message for us, but we need to pause.

    finishedCards.push(path);
    matchingCards.splice(indexNum, 1);

    if (matchingCards.length <= 0) {
        // All cards have been patched
        rl.question("All cards patched!\n");
        if (fs.existsSync(finishedCardsPath)) fs.unlinkSync(finishedCardsPath);

        process.exit(0); // Exit so it doesn't save
    }
}

// Save progress
fs.writeFileSync(finishedCardsPath, finishedCards.join('\n'));
