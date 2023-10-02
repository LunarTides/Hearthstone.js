/**
 * A collection of functions relating to reading and writing ids of blueprints.
 * 
 * @module Id Script
 */

import { createGame } from "../src/internal.js";

const { game, player1, player2 } = createGame();

const idRegex = / {4}id: (\d+)/;

function searchCards(callback: (path: string, content: string, id: number) => void, path?: string) {
    game.functions.searchCardsFolder((fullPath, content) => {
        const idMatch = content.match(idRegex);
        if (!idMatch) {
            game.logError(`No id found in ${fullPath}`);
            return;
        }

        const id = Number(idMatch[1]);
        callback(fullPath, content, id);
    });
}

function change(startId: number, callback: (id: number) => number, log: boolean) {
    let updated = 0;

    searchCards((path, content, id) => {
        if (id < startId) {
            if (log) game.log(`<bright:yellow>Skipping ${path}</bright:yellow>`);
            return;
        }

        const newId = callback(id);

        // Set the new id
        game.functions.writeFile(path, content.replace(idRegex, `    id: ${newId}`));

        if (log) game.log(`<bright:green>Updated ${path}</bright:green>`);
        updated++;
    });

    if (updated > 0) {
        const latestId = Number(game.functions.readFile("/cards/.latestId"));
        const newLatestId = callback(latestId);

        game.functions.writeFile("/cards/.latestId", newLatestId.toString());
    }

    if (log) {
        if (updated > 0) game.log("<bright:green>Updated %s cards.</bright:green>", updated);
        else game.log("<yellow>No cards were updated.</yellow>");
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
    const ids: [[number, string]] = [[-1, ""]];

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
            if (log) game.logError(`<bright:yellow>Duplicate id in ${path}. Previous id: ${currentId}. Got id: ${id}</bright:yellow>`);
            duplicates++;
        }
        else if (id != currentId + 1) {
            if (log) game.logError(`<bright:yellow>Hole in ${path}. Previous id: ${currentId}. Got id: ${id}</bright:yellow>`);
            holes++;
        }

        currentId = id;
    });

    // Check if the .latestId is valid
    const latestId = parseInt(game.functions.readFile("/cards/.latestId").trim());

    if (log) {
        if (holes > 0) game.log("<yellow>Found %s holes.</yellow>", holes);
        else game.log("<bright:green>No holes found.</bright:green>");

        if (duplicates > 0) game.log("<yellow>Found %s duplicates.</yellow>", duplicates);
        else game.log("<bright:green>No duplicates found.</bright:green>");

        if (latestId === currentId) game.log("<bright:green>Latest id up-to-date.</bright:green>");
        else {
            game.log("<yellow>Latest id is invalid. Latest id found: %s, latest id in file: %s. Fixing...</yellow>", currentId, latestId);
            game.functions.writeFile("/cards/.latestId", currentId.toString());
        }
    }

    return [holes, duplicates];
}

function main() {
    // Check if your git is clean
    const gitStatus = game.functions.runCommand("git status --porcelain");
    if (typeof gitStatus === "string") {
        game.logError("<yellow>WARNING: You have uncommitted changes. Please commit them before running a non-safe command.</yellow>");
        //process.exit(1);
    }

    game.logError("<yellow>WARNING: Be careful with this script. This might break things that are dependent on ids remaining the same, like deckcodes.</yellow>");
    game.log("<green>The validate and quit commands are safe to use without issue.</green>");

    type Commands = "i" | "d" | "v" | "q";

    let func = game.input("\nWhat do you want to do? ([i]ncrement, [d]ecrement, [v]alidate, [q]uit): ")[0] as Commands;
    if (!func) throw new Error("Invalid command");

    func = func.toLowerCase() as Commands;
    const destructive = ["i", "d"] as Commands[];

    if (destructive.includes(func)) {
        game.logError("<yellow>WARNING: This is a destructive action. Be careful.</yellow>\n");
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

    game.log("Done");
}

main();
