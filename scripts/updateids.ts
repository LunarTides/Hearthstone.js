
/**
 * This will decrement the ids of all cards from a starting id.
 * If the starting id is 50, it will decrement the ids of all cards with an id of 50 or more. 
 * This is useful if you delete a card, and want to decrement the ids of the remaining cards to match.
 * 
 * @module Update Ids
 */

import rl from "readline-sync";
import fs from "fs";
import { execSync as run } from "child_process";
import { createGame } from "../src/internal.js";
import chalk from "chalk";

const { game, player1, player2 } = createGame();

const idRegex = / {4}id: (\d+)/;

function searchCards(path?: string) {
    if (!path) path = game.functions.dirname() + "../cards";
    if (path.includes("cards/Tests")) return; // We don't care about test cards

    path = path.replaceAll("\\", "/").replace("/dist/..", "");

    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        let p = `${path}/${file.name}`;

        if (file.name.endsWith(".mts")) {
            // It is an actual card.
            let data = fs.readFileSync(p, { encoding: 'utf8', flag: 'r' });

            // The query is a regex
            let idMatch = data.match(idRegex);
            if (!idMatch) {
                console.error(`No id found in ${p}`);
                return;
            }

            let id = Number(idMatch[1]);
            if (id < startId) {
                console.log(chalk.yellowBright(`Skipping ${p}`));
                return;
            }

            // Decrement the id
            fs.writeFileSync(p, data.replace(idRegex, `    id: ${id - 1}`));

            console.log(chalk.greenBright(`Updated ${p}`));
        }
        else if (file.isDirectory()) searchCards(p);
    });
}

// Check if your git is clean
const gitStatus = run("git status --porcelain").toString();
if (gitStatus) {
    console.log(chalk.yellow("WARNING: You have uncommitted changes. Please commit them before running this script."));
    //process.exit(1);
}

let startId: number = Number(rl.question("What id to start at: "));
if (!startId) throw new Error("Invalid start id");

searchCards(); // Ignore case
console.log("Done");
