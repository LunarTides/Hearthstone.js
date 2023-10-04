/**
 * The crash test script.
 * @module Crash Test
 */
import { createGame } from "../src/internal.js";
import decks from "../decks.json" assert { type: "json" };

const gamesEnv = process.env.games ?? "";
const games = parseInt(gamesEnv) ?? 100;

function main() {
    game.logWarn(`Press enter to play ${games} games`);
    if (!process.env.games) game.log("Set the GAMES env variable to change how many games to play.");
    game.log("NOTE: If you see no progress being made for an extended period of time, chances are the game got stuck in an infinite loop.");
    game.input();

    for (let index = 0; index < games; index++) {
        // If you're redirecting output to a file, show a progress bar
        if (!process.stdout.isTTY) process.stderr.write(`\r\x1b[KPlaying game #${index + 1} / ${games}...`);

        // Test the main game
        const { game, player1, player2 } = createGame();

        // Setup the ais
        game.config.ai.player1 = true;
        game.config.ai.player2 = true;
        game.doConfigAI();

        game.noInput = true;

        // Choose random decks for the players
        for (let i = 0; i < 2; i++) {
            const plr = game.functions.util.getPlayerFromId(i);

            const deck = game.lodash.sample(decks);
            if (typeof deck === "string") game.functions.deckcode.import(plr, deck);
        }

        game.startGame();
        game.interact.card.mulligan(player1);
        game.interact.card.mulligan(player2);

        try {
            while (game.running) game.interact.gameLoop.doTurn();
        } catch(err) {
            // If it crashes, show the ai's actions, and the history of the game before actually crashing
            game.config.general.debug = true;
            game.functions.util.createLogFile(err);

            game.interact.gameLoop.handleCmds("/ai");
            game.interact.gameLoop.handleCmds("history", { debug: true });

            game.log("THE GAME CRASHED: LOOK ABOVE FOR THE HISTORY, AND THE AI'S LOGS.");

            throw err;
        }
    }

    game.logWarn("Test passed!");
    game.input();
}

main();
