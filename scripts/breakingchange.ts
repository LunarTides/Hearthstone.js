/**
 * The breaking change script.
 * @module Breaking Change
 */

import rl from "readline-sync";
import fs from "fs";
import { createGame } from "../src/internal.js";

const { game, player1, player2 } = createGame();

let matchingCards: string[] = [];
let finishedCards: string[] = [];

let finishedCardsPath = "patched_cards.txt";

function getFinishedCards(path: string) {
    if (!fs.existsSync(path)) return; // If the file doesn't exist, return.

    let cards = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
    finishedCards = cards.split("\n");
}

function searchCards(query: RegExp | string, path?: string) {
    if (!path) path = game.functions.dirname() + "../cards";
    if (path.includes("cards/Tests")) return; // We don't care about test cards

    path = path.replaceAll("\\", "/").replace("/dist/..", "");

    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        let p = `${path}/${file.name}`;

        if (file.name.endsWith(".mts")) {
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

function main() {
    game.interact.cls();
    let use_regex = rl.keyInYN("Do you want to use regular expressions? (Don't do this unless you know what regex is, and how to use it)");
    let search: string | RegExp = rl.question("Search: ");

    if (use_regex) search = new RegExp(search, "i");

    finishedCardsPath = `./${search}_${finishedCardsPath}`;
    finishedCardsPath = finishedCardsPath.replace(/[^\w ]/g, "_"); // Remove any character that is not in /A-Za-z0-9_ /

    getFinishedCards(finishedCardsPath);
    searchCards(search); // Ignore case

    game.log(); // New line

    while (true) {
        game.interact.cls();

        matchingCards.forEach((c, i) => {
            // `c` is the path to the card.
            game.log(`${i + 1}: ${c}`);
        });

        let cmd = rl.question("\nWhich card do you want to fix (type 'done' to finish | type 'delete' to delete the save file): ");
        if (cmd.toLowerCase().startsWith("done")) break;
        if (cmd.toLowerCase().startsWith("delete")) {
            game.log("Deleting file...");

            if (fs.existsSync(finishedCardsPath)) {
                fs.unlinkSync(finishedCardsPath);
                game.log("File deleted!");
            }
            else game.log("File not found!");

            rl.question();
            process.exit(0);
        }

        let index = parseInt(cmd) - 1;
        if (!index) continue;

        let path = matchingCards[index];
        if (!path) {
            game.log("Invalid index!");
            rl.question();

            continue;
        }

        // `card` is the path to that card.
        // TODO: This is broken
        let success = game.functions.openWithArgs(game.config.general.editor, `"${path}"`);
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
}

main();
