/**
 * The breaking change script.
 * @module Breaking Change
 */

import rl from "readline-sync";
import { createGame } from "../src/internal.js";

const { game, player1, player2 } = createGame();

const matchingCards: string[] = [];
let finishedCards: string[] = [];

let finishedCardsPath = "patchedCards.txt";

function getFinishedCards(path: string) {
    // If the file doesn't exist, return.
    if (!game.functions.file.exists(path)) return;

    const cards = game.functions.file.read(path);
    finishedCards = cards.split("\n");
}

function searchCards(query: RegExp | string) {
    game.functions.file.directory.searchCards((fullPath, content) => {
        // The query is not a regular expression
        if (typeof query === 'string') {
            if (content.includes(query)) matchingCards.push(fullPath);
            return;
        }

        // The query is a regex
        if (query.test(content)) matchingCards.push(fullPath);
    });
}

function main() {
    game.interact.cls();
    const useRegex = rl.keyInYN("Do you want to use regular expressions? (Don't do this unless you know what regex is, and how to use it)");
    let search: string | RegExp = game.input("Search: ");

    // Ignore case
    if (useRegex) search = new RegExp(search, "i");

    finishedCardsPath = `./${search}_${finishedCardsPath}`;
    // Remove any character that is not in /A-Za-z0-9_ /
    finishedCardsPath = finishedCardsPath.replace(/[^\w ]/g, "_");

    getFinishedCards(finishedCardsPath);
    searchCards(search);

    // New line
    game.log();

    while (true) {
        game.interact.cls();

        matchingCards.forEach((c, i) => {
            // `c` is the path to the card.
            game.log(`${i + 1}: ${c}`);
        });

        const cmd = game.input("\nWhich card do you want to fix (type 'done' to finish | type 'delete' to delete the save file): ");
        if (cmd.toLowerCase().startsWith("done")) break;
        if (cmd.toLowerCase().startsWith("delete")) {
            game.log("Deleting file...");

            if (game.functions.file.exists(finishedCardsPath)) {
                game.functions.file.delete(finishedCardsPath);
                game.log("File deleted!");
            }
            else game.log("File not found!");

            game.pause();
            process.exit(0);
        }

        const index = parseInt(cmd) - 1;
        if (!index) continue;

        const path = matchingCards[index];
        if (!path) {
            game.log("Invalid index!");
            game.pause();

            continue;
        }

        // `card` is the path to that card.
        const success = game.functions.util.runCommandAsChildProcess(`${game.config.general.editor} "${game.functions.file.dirname() + path}"`);
        // The `runCommandAsChildProcess` shows an error message for us, but we need to pause.
        if (!success) game.pause();

        finishedCards.push(path);
        matchingCards.splice(index, 1);

        if (matchingCards.length <= 0) {
            // All cards have been patched
            game.pause("All cards patched!\n");
            if (game.functions.file.exists(finishedCardsPath)) game.functions.file.delete(finishedCardsPath);

            // Exit so it doesn't save
            process.exit(0);
        }
    }

    // Save progress
    game.functions.file.write(finishedCardsPath, finishedCards.join("\n"));
}

main();
