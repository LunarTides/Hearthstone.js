/**
 * The entry point of the game.
 * 
 * Hearthstone.js - Hearthstone but console based.
 * Copyright (C) 2022  LunarTides
 * 
 * @module Index
 */

import { createGame } from "./internal.js";

export function main() {
    const { game, player1, player2 } = createGame();

    game.interact.printName();
    warnAboutOutdatedCards();

    // Ask the players for deck codes.
    [player1, player2].forEach(plr => {
        if (plr.deck.length > 0) return;
        
        // Put this in a while loop to make sure the function repeats if it fails.
        while (!game.interact.deckCode(plr)) {};
    });

    game.startGame();

    game.interact.mulligan(player1);
    game.interact.mulligan(player2);

    try {
        // Game loop
        while (game.running) game.interact.doTurn();
    } catch (err) {
        // Create error report file
        game.functions.createLogFile(err);

        throw err;
    }
}

let outdatedCards: string[] = [];
const outdatedExtensions: string[] = [];
const updatedCards: string[] = [];
function warnAboutOutdatedCards() {
    // TODO: This doesn't quite work
    findOutdatedCards(game.functions.dirname() + "/cards");
    outdatedCards = outdatedCards.filter(card => !updatedCards.includes(card));

    if (outdatedCards.length <= 0 && outdatedExtensions.length <= 0) return;

    outdatedCards.forEach(p => {
        game.logWarn(`<yellow>WARNING: Outdated card found: ${p}.js</yellow>`);
    });

    outdatedExtensions.forEach(p => {
        game.logWarn(`<yellow>WARNING: Outdated extension found: ${p}.mts. Please change all card file names ending with the '.mts' extension to '.ts' instead.</yellow>`);
    });

    game.logWarn("Run the `upgradecards` script to automatically update outdated cards from pre 2.0.");
    game.logWarn("This will only upgrade pre 2.0 cards to 2.0 cards.");
    game.logWarn("You can play the game without upgrading the cards, but the cards won't be registered.");
    game.logWarn("Run the script by running `npm run script:upgradecards`.");

    const proceed = game.input("\nDo you want to proceed? ([y]es, [n]o): ").toLowerCase()[0] === "y";
    if (!proceed) process.exit(0);
}

function findOutdatedCards(path: string) {
    if (path.includes("cards/Test")) return;

    game.functions.readDirectory(path).forEach(file => {
        const p = `${path}/${file.name}`.replace("/dist/..", "");

        if (file.name.endsWith(".mts")) {
            outdatedExtensions.push(p.slice(0, -4))
        }

        if (file.name.endsWith(".js")) {
            outdatedCards.push(p.slice(0, -3));
        }
        if (file.name.endsWith(".ts")) {
            updatedCards.push(p.slice(0, -3));
        }
        else if (file.isDirectory()) findOutdatedCards(p);
    });
}
