/**
 * The entry point of the game.
 * 
 * Hearthstone.js - Hearthstone but console based.
 * Copyright (C) 2022  LunarTides
 * 
 * @module Index
 */

import { createGame } from "./internal.js";
import fs from "fs";

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
        game.functions.createLogFile(err); // Create error report file

        throw err;
    }
}

let outdatedCards: string[] = [];
let updatedCards: string[] = [];
function warnAboutOutdatedCards() {
    findOutdatedCards(game.functions.dirname() + "../cards");
    outdatedCards = outdatedCards.filter(card => !updatedCards.includes(card));

    if (outdatedCards.length <= 0) return;

    outdatedCards.forEach(p => {
        game.logWarn(`<yellow>WARNING: Outdated card found: ${p}.js</yellow>`);
    });

    game.logWarn("Run the `upgradecards` script to automatically update outdated cards from pre 2.0.");
    game.logWarn("This will only upgrade pre 2.0 cards to 2.0 cards.");
    game.logWarn("You can play the game without upgrading the cards, but the cards won't be registered.");
    game.logWarn("Run the script by running `npm run script:upgradecards`.");

    let proceed = game.input("\nDo you want to proceed? ([y]es, [n]o): ").toLowerCase()[0] === "y";
    if (!proceed) process.exit(0);
}

function findOutdatedCards(path: string) {
    fs.readdirSync(path, { withFileTypes: true }).forEach(file => {
        let p = `${path}/${file.name}`;

        if (file.name.endsWith(".js")) {
            outdatedCards.push(p.replace("/dist/..", "").slice(0, -3));
        }
        if (file.name.endsWith(".mts")) {
            updatedCards.push(p.replace("/dist/..", "").slice(0, -4));
        }
        else if (file.isDirectory()) findOutdatedCards(p);
    })
}
