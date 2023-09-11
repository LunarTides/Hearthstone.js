/**
 * A collection of functions relating to reading and writing ids of blueprints.
 * 
 * @module Id Script
 */

import fs from "fs";
import { execSync as run } from "child_process";
import { createGame } from "../src/internal.js";
import chalk from "chalk";

const { game, player1, player2 } = createGame();

const idRegex = / {4}id: (\d+)/;

function searchCards(callback: (path: string, content: string, id: number) => void, path?: string) {
    if (!path) path = game.functions.dirname() + "../cards";
    if (path.includes("cards/Tests")) return; // We don't care about test cards

    path = path.replaceAll("\\", "/").replace("/dist/..", "");

    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        let fullPath = `${path}/${file.name}`;

        if (file.name.endsWith(".mts")) {
            // It is an actual card.
            let data = fs.readFileSync(fullPath, { encoding: 'utf8', flag: 'r' });

            // The query is a regex
            let idMatch = data.match(idRegex);
            if (!idMatch) {
                console.error(`No id found in ${fullPath}`);
                return;
            }

            let id = Number(idMatch[1]);
            callback(fullPath, data, id);
        }
        else if (file.isDirectory()) searchCards(callback, fullPath);
    });
}

function change(startId: number, callback: (id: number) => number, log: boolean) {
    let updated = 0;

    searchCards((path, content, id) => {
        if (id < startId) {
            if (log) console.log(chalk.yellowBright(`Skipping ${path}`));
            return;
        }

        let newId = callback(id);

        // Set the new id
        fs.writeFileSync(path, content.replace(idRegex, `    id: ${newId}`));

        if (log) console.log(chalk.greenBright(`Updated ${path}`));
        updated++;
    });

    if (updated > 0) {
        let latestId = Number(fs.readFileSync(game.functions.dirname() + "../cards/.latest_id", { encoding: "utf8" }));
        let newLatestId = callback(latestId);

        fs.writeFileSync(game.functions.dirname() + "../cards/.latest_id", newLatestId.toString());
    }

    if (log) {
        if (updated > 0) console.log(chalk.greenBright("Updated %s cards."), updated);
        else console.log(chalk.yellow("No cards were updated."));
    }

    return updated;
}

/**
 * Decrement the ids of all cards from a starting id.
 * If the starting id is 50, it will decrement the ids of all cards with an id of 50 or more.
 * This is useful if you delete a card, and want to decrement the ids of the remaining cards to match.
 * 
 * @param startId The starting id
 * @param log If it should log what it's doing. This should probably be false when using this as a library.
 * 
 * @returns The number of cards that were updated
 */
export function decrement(startId: number, log: boolean) {
    return change(startId, id => id - 1, log);
}

/**
 * Increment the ids of all cards from a starting id.
 * If the starting id is 50, it will increment the ids of all cards with an id of 50 or more.
 * This is useful if you add a card between two ids, and want to increment the ids of the remaining cards to match.
 * 
 * @param startId The starting id
 * @param log If it should log what it's doing. This should probably be false when using this as a library.
 * 
 * @returns The number of cards that were updated
 */
export function increment(startId: number, log: boolean) {
    return change(startId, id => id + 1, log);
}

/**
 * Check for holes in the ids.
 * If there is a card with an id of 58 and a card with an id of 60, but no card with an id of 59, that is a hole.
 * 
 * @param log If it should log what it's doing. This should probably be false when using this as a library.
 * 
 * @returns Amount of holes, and amount of duplicates
 */
export function validate(log: boolean): [number, number] {
    let ids: [[number, string]] = [[-1, ""]];

    searchCards((path, content, id) => {
        ids.push([id, path]);
    });

    ids.sort((a, b) => a[0] - b[0]);

    // Check if there are any holes
    let currentId = 0;
    let holes = 0;
    let duplicates = 0;

    ids.forEach(([id, path]) => {
        if (id === -1) return;

        if (id === currentId) {
            if (log) console.error(chalk.yellowBright(`Duplicate id in ${path}. Previous id: ${currentId}. Got id: ${id}`));
            duplicates++;
        }
        else if (id != currentId + 1) {
            if (log) console.error(chalk.yellowBright(`Hole in ${path}. Previous id: ${currentId}. Got id: ${id}`));
            holes++;
        }

        currentId = id;
    });

    if (log) {
        if (holes > 0) console.log(chalk.yellow("Found %s holes."), holes);
        else console.log(chalk.greenBright("No holes found."));

        if (duplicates > 0) console.log(chalk.yellow("Found %s duplicates."), duplicates);
        else console.log(chalk.greenBright("No duplicates found."));
    }

    return [holes, duplicates];
}

function main() {
    // Check if your git is clean
    const gitStatus = run("git status --porcelain").toString();
    if (gitStatus) {
        console.error(chalk.yellow("WARNING: You have uncommitted changes. Please commit them before running a non-safe command."));
        //process.exit(1);
    }

    console.error(chalk.yellow("WARNING: Be careful with this script. This might break things that are dependent on ids remaining the same, like deckcodes."));
    console.log(chalk.green("The validate and quit commands are safe to use without issue."));

    type Commands = "i" | "d" | "v" | "q";

    let func = game.input("\nWhat do you want to do? ([i]ncrement, [d]ecrement, [v]alidate, [q]uit): ")[0] as Commands;
    if (!func) throw new Error("Invalid command");

    func = func.toLowerCase() as Commands;
    const destructive = ["i", "d"] as Commands[];

    if (destructive.includes(func)) {
        console.error(chalk.yellow("WARNING: This is a destructive action. Be careful.\n"));
    }

    let startId: number;

    switch (func) {
        case "i":
            startId = Number(game.input("What id to start at: "));
            if (!startId) throw new Error("Invalid start id");

            increment(startId, true);
            break;
        case "d":
            startId = Number(game.input("What id to start at: "));
            if (!startId) throw new Error("Invalid start id");

            decrement(startId, true);
            break;
        case "v":
            validate(true);
            break;
        case "q":
            process.exit(0);

        default:
            throw new Error("Invalid command");
    }

    console.log("Done");
}

main();
